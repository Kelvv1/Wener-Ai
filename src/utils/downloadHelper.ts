/**
 * Universal media download utility for images and videos.
 * Handles Data URLs, SVGs, CORS-restricted CDNs, and mobile/desktop browsers reliably.
 */

export async function downloadMediaFile(
  mediaUrl: string,
  preferredFilename: string,
  onStatusChange?: (status: 'idle' | 'downloading' | 'success' | 'error', message?: string) => void
): Promise<boolean> {
  if (!mediaUrl) {
    onStatusChange?.('error', 'No media URL provided for download.');
    return false;
  }

  onStatusChange?.('downloading', 'Preparing download...');

  try {
    // Case 1: SVG Data URL (commonly used for generated image outputs)
    // Convert SVG to high-res PNG for native user photo gallery compatibility
    if (mediaUrl.startsWith('data:image/svg+xml')) {
      const pngFilename = preferredFilename.replace(/\.(svg|webp|jpg|jpeg)$/i, '') + '.png';
      const success = await convertSvgDataUrlToPngBlob(mediaUrl, pngFilename);
      if (success) {
        onStatusChange?.('success', 'Image downloaded successfully!');
        return true;
      }
    }

    // Case 2: Other Data URL (e.g., base64 PNG, JPEG, or Video)
    if (mediaUrl.startsWith('data:')) {
      const blob = dataUrlToBlob(mediaUrl);
      if (blob) {
        triggerBlobDownload(blob, preferredFilename);
        onStatusChange?.('success', 'File downloaded successfully!');
        return true;
      }
    }

    // Case 3: Blob URL
    if (mediaUrl.startsWith('blob:')) {
      triggerDirectAnchorDownload(mediaUrl, preferredFilename);
      onStatusChange?.('success', 'File downloaded successfully!');
      return true;
    }

    // Case 4: Remote HTTP/HTTPS URL (videos, external CDN images)
    // First attempt direct client-side fetch (fastest)
    try {
      const response = await fetch(mediaUrl, { mode: 'cors' });
      if (response.ok) {
        const blob = await response.blob();
        triggerBlobDownload(blob, preferredFilename);
        onStatusChange?.('success', 'File downloaded successfully!');
        return true;
      }
    } catch {
      // Direct fetch may be blocked by CORS headers on some external video CDNs
      // Fall through to server-side download proxy
    }

    // Attempt server-side download proxy
    try {
      const proxyUrl = `/api/download?url=${encodeURIComponent(mediaUrl)}&filename=${encodeURIComponent(preferredFilename)}`;
      const proxyResponse = await fetch(proxyUrl);
      if (proxyResponse.ok) {
        const blob = await proxyResponse.blob();
        triggerBlobDownload(blob, preferredFilename);
        onStatusChange?.('success', 'File downloaded successfully!');
        return true;
      }
    } catch {
      // Server proxy not available or failed
    }

    // Ultimate fallback: open or trigger anchor with target blank
    triggerDirectAnchorDownload(mediaUrl, preferredFilename);
    onStatusChange?.('success', 'Download initiated in your browser!');
    return true;
  } catch (err: any) {
    console.error('Download media error:', err);
    // Fallback: direct anchor click
    try {
      triggerDirectAnchorDownload(mediaUrl, preferredFilename);
      onStatusChange?.('success', 'Download initiated!');
      return true;
    } catch (e: any) {
      onStatusChange?.('error', e.message || 'Unable to download file.');
      return false;
    }
  }
}

/**
 * Converts an SVG Data URL to a pristine PNG Blob and triggers immediate download
 */
async function convertSvgDataUrlToPngBlob(svgDataUrl: string, filename: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // Render at crisp 1024x1024 or natural dimensions
        const width = img.naturalWidth || 1024;
        const height = img.naturalHeight || 1024;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          triggerDirectAnchorDownload(svgDataUrl, filename);
          return resolve(true);
        }

        ctx.fillStyle = '#0a0d18';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              triggerBlobDownload(blob, filename);
              resolve(true);
            } else {
              triggerDirectAnchorDownload(svgDataUrl, filename);
              resolve(true);
            }
          },
          'image/png',
          0.95
        );
      } catch (err) {
        console.warn('Canvas export error:', err);
        triggerDirectAnchorDownload(svgDataUrl, filename);
        resolve(true);
      }
    };

    img.onerror = () => {
      triggerDirectAnchorDownload(svgDataUrl, filename);
      resolve(true);
    };

    img.src = svgDataUrl;
  });
}

/**
 * Converts a generic base64 data URL to a binary Blob
 */
function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return null;

    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const binary = atob(parts[1]);
    const array = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }

    return new Blob([array], { type: mime });
  } catch (err) {
    console.error('Failed to parse data URL to blob:', err);
    return null;
  }
}

/**
 * Triggers a download from a Blob using an ephemeral object URL
 */
function triggerBlobDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();

  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
  }, 3000);
}

/**
 * Triggers download using an anchor element
 */
function triggerDirectAnchorDownload(url: string, filename: string) {
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = url;
  anchor.download = filename;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();

  setTimeout(() => {
    if (document.body.contains(anchor)) {
      document.body.removeChild(anchor);
    }
  }, 3000);
}
