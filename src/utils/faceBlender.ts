/**
 * Winer AI - High Fidelity Seamless Face Blending Engine
 * Combines anatomical contour masking, multi-stop radial & Gaussian feathering,
 * skin-tone color harmonization, and ambient light transfer to merge faces as one.
 */

export interface FaceMergeOptions {
  scale?: number; // 0.7 to 1.3, default 1.0
  offsetX?: number; // -100 to +100 px, default 0
  offsetY?: number; // -100 to +100 px, default 0
  featherRadius?: number; // feather strength in px (default 18)
  blendMode?: 'harmonized' | 'photorealistic' | 'cinematic';
  skinWarmth?: number; // -0.2 to +0.2
  skinBrightness?: number; // -0.2 to +0.2
  twoWaySwap?: boolean;
}

/**
 * Escapes XML strings for safe SVG embedding
 */
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Creates an ultra-smooth, seamlessly merged Face Swap SVG
 * Uses anatomical facial contour with multi-stage Gaussian blur feathering
 * and an ambient lighting transfer pass for unnoticeable transitions.
 */
export function generateSeamlessFaceSwapSvg(
  targetUrl: string,
  sourceUrl: string,
  options: FaceMergeOptions = {}
): string {
  const {
    scale = 1.0,
    offsetX = 0,
    offsetY = 0,
    featherRadius = 22,
    blendMode = 'harmonized',
    skinWarmth = 0.04,
    skinBrightness = 0.02,
    twoWaySwap = false,
  } = options;

  const safeTarget = escapeXml(targetUrl);
  const safeSource = escapeXml(sourceUrl);

  // Dynamic face sizing & positioning centered on natural human portrait face location
  const baseW = 340 * scale;
  const baseH = 430 * scale;
  const posX = 400 - baseW / 2 + offsetX;
  const posY = 350 - baseH / 2 + offsetY;

  // Face contour center and radii
  const faceCx = 400 + offsetX;
  const faceCy = 360 + offsetY;
  const faceRx = 140 * scale;
  const faceRy = 185 * scale;

  // Adjust color matrix based on user warmth and brightness
  const rRed = (1.02 + skinWarmth + skinBrightness).toFixed(2);
  const rGreen = (1.0 + skinBrightness).toFixed(2);
  const rBlue = (0.98 - skinWarmth * 0.5 + skinBrightness).toFixed(2);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <!-- Soft Gaussian blur filter for seamless feathering boundary -->
    <filter id="softFeatherFilter" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="${featherRadius}" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="atop" />
    </filter>

    <!-- Multi-stage Radial Gradient for deep interior opacity and ultra-soft boundary transition -->
    <radialGradient id="organicFaceFeather" cx="50%" cy="48%" r="48%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
      <stop offset="55%" stop-color="#ffffff" stop-opacity="1" />
      <stop offset="74%" stop-color="#ffffff" stop-opacity="0.88" />
      <stop offset="88%" stop-color="#ffffff" stop-opacity="0.45" />
      <stop offset="96%" stop-color="#ffffff" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>

    <!-- Seamless Facial Contour Mask with organic jawline and forehead curves -->
    <mask id="seamlessFaceMask" maskUnits="userSpaceOnUse" x="0" y="0" width="800" height="800">
      <g filter="url(#softFeatherFilter)">
        <!-- Anatomical Face shape path: wide temples, tapering down along jawline to rounded chin -->
        <path d="
          M ${faceCx} ${faceCy - faceRy}
          C ${faceCx + faceRx * 0.9} ${faceCy - faceRy * 0.95}, ${faceCx + faceRx * 1.02} ${faceCy - faceRy * 0.3}, ${faceCx + faceRx * 0.98} ${faceCy}
          C ${faceCx + faceRx * 0.95} ${faceCy + faceRy * 0.35}, ${faceCx + faceRx * 0.65} ${faceCy + faceRy * 0.82}, ${faceCx} ${faceCy + faceRy}
          C ${faceCx - faceRx * 0.65} ${faceCy + faceRy * 0.82}, ${faceCx - faceRx * 0.95} ${faceCy + faceRy * 0.35}, ${faceCx - faceRx * 0.98} ${faceCy}
          C ${faceCx - faceRx * 1.02} ${faceCy - faceRy * 0.3}, ${faceCx - faceRx * 0.9} ${faceCy - faceRy * 0.95}, ${faceCx} ${faceCy - faceRy}
          Z"
          fill="url(#organicFaceFeather)" />
      </g>
    </mask>

    <!-- Skin Tone & Luminosity Harmonization Filter -->
    <filter id="skinToneHarmonize" x="0%" y="0%" width="100%" height="100%">
      <feColorMatrix type="matrix" values="
        ${rRed} 0 0 0 0.02
        0 ${rGreen} 0 0 0.01
        0 0 ${rBlue} 0 -0.01
        0 0 0 1 0" />
      ${
        blendMode === 'cinematic'
          ? `<feComponentTransfer>
               <feFuncR type="linear" slope="1.06" />
               <feFuncG type="linear" slope="1.03" />
               <feFuncB type="linear" slope="0.98" />
             </feComponentTransfer>`
          : ''
      }
    </filter>

    <!-- Diffuse Ambient Edge Blend filter -->
    <filter id="diffuseEdge">
      <feGaussianBlur stdDeviation="3" />
    </filter>
  </defs>

  <!-- LAYER 1: Base Target Portrait (Body, Hair, Background, Shoulders) -->
  <image href="${safeTarget}" x="0" y="0" width="800" height="800" preserveAspectRatio="xMidYMid slice" />

  <!-- LAYER 2: Transferred Source Face with Feathered Anatomical Mask & Harmonized Tone -->
  <g mask="url(#seamlessFaceMask)">
    <!-- Base aligned source face -->
    <image href="${safeSource}" x="${posX}" y="${posY}" width="${baseW}" height="${baseH}" preserveAspectRatio="xMidYMid slice" filter="url(#skinToneHarmonize)" />
    
    <!-- Ambient Light Transfer Pass: overlays target photo's natural lighting & shadows onto the swapped face -->
    <image href="${safeTarget}" x="0" y="0" width="800" height="800" preserveAspectRatio="xMidYMid slice" style="mix-blend-mode: soft-light; opacity: 0.35;" />
  </g>

  <!-- LAYER 3: Optional Two-Way Swap Inset -->
  ${
    twoWaySwap
      ? `
  <g transform="translate(24, 24)">
    <rect width="180" height="180" rx="16" fill="#09090b" stroke="rgba(255,255,255,0.25)" stroke-width="2" />
    <image href="${safeSource}" x="0" y="0" width="180" height="180" preserveAspectRatio="xMidYMid slice" rx="16" />
    <g transform="scale(0.24) translate(40, 40)" mask="url(#seamlessFaceMask)">
      <image href="${safeTarget}" x="0" y="0" width="800" height="800" preserveAspectRatio="xMidYMid slice" />
    </g>
    <rect y="148" width="180" height="32" fill="rgba(0,0,0,0.85)" rx="0 0 16 16" />
    <text x="90" y="169" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#a855f7" text-anchor="middle" letter-spacing="0.5">TWO-WAY MERGE</text>
  </g>`
      : ''
  }

  <!-- LAYER 4: Mandatory Winer AI Watermark (Authenticity & Compliance) -->
  <g id="winer-ai-watermark" transform="translate(560, 746)">
    <rect x="-10" y="-18" width="225" height="36" rx="10" fill="rgba(9, 13, 24, 0.90)" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />
    <circle cx="6" cy="0" r="4" fill="#6366f1" />
    <text x="108" y="5" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="900" text-anchor="middle" fill="#ffffff" letter-spacing="1.2">
      WINER AI • SWAP
    </text>
  </g>
</svg>`;

  try {
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  } catch {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}

/**
 * High-performance HTML5 Canvas Face Blending
 * Directly rasterizes and merges the two faces with canvas compositing and smooth alpha feathering.
 */
export async function blendFacesOnCanvas(
  targetUrl: string,
  sourceUrl: string,
  options: FaceMergeOptions = {}
): Promise<string> {
  return new Promise((resolve) => {
    const targetImg = new Image();
    targetImg.crossOrigin = 'anonymous';

    const sourceImg = new Image();
    sourceImg.crossOrigin = 'anonymous';

    let targetLoaded = false;
    let sourceLoaded = false;

    const onBothLoaded = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = 1000;
        const height = 1000;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(generateSeamlessFaceSwapSvg(targetUrl, sourceUrl, options));
          return;
        }

        // 1. Draw Target Image (Base)
        ctx.drawImage(targetImg, 0, 0, width, height);

        // 2. Prepare Face Layer with Anatomical Mask & Soft Feathering
        const faceCanvas = document.createElement('canvas');
        faceCanvas.width = width;
        faceCanvas.height = height;
        const fCtx = faceCanvas.getContext('2d');

        if (fCtx) {
          const scale = options.scale || 1.0;
          const offsetX = options.offsetX || 0;
          const offsetY = options.offsetY || 0;

          const cx = width / 2 + offsetX;
          const cy = height * 0.45 + offsetY;
          const rx = 175 * scale;
          const ry = 230 * scale;

          // Create organic anatomical face path
          fCtx.beginPath();
          fCtx.moveTo(cx, cy - ry);
          fCtx.bezierCurveTo(cx + rx * 0.9, cy - ry * 0.95, cx + rx * 1.02, cy - ry * 0.3, cx + rx * 0.98, cy);
          fCtx.bezierCurveTo(cx + rx * 0.95, cy + ry * 0.35, cx + rx * 0.65, cy + ry * 0.82, cx, cy + ry);
          fCtx.bezierCurveTo(cx - rx * 0.65, cy + ry * 0.82, cx - rx * 0.95, cy + ry * 0.35, cx - rx * 0.98, cy);
          fCtx.bezierCurveTo(cx - rx * 1.02, cy - ry * 0.3, cx - rx * 0.9, cy - ry * 0.95, cx, cy - ry);
          fCtx.closePath();

          // Create radial gradient for soft-feathered edge falloff
          const radGrad = fCtx.createRadialGradient(cx, cy, rx * 0.45, cx, cy, rx * 1.05);
          radGrad.addColorStop(0, 'rgba(0,0,0,1)');
          radGrad.addColorStop(0.65, 'rgba(0,0,0,0.95)');
          radGrad.addColorStop(0.85, 'rgba(0,0,0,0.5)');
          radGrad.addColorStop(1, 'rgba(0,0,0,0)');

          fCtx.fillStyle = radGrad;
          fCtx.fill();

          // Clip to the feathered face mask
          fCtx.globalCompositeOperation = 'source-in';

          const sW = 420 * scale;
          const sH = 540 * scale;
          fCtx.drawImage(sourceImg, cx - sW / 2, cy - sH / 2, sW, sH);

          // Draw the blended face back onto the base canvas
          ctx.save();
          ctx.drawImage(faceCanvas, 0, 0);

          // Ambient lighting pass: blend target lighting with soft-light mode
          ctx.globalCompositeOperation = 'soft-light';
          ctx.globalAlpha = 0.35;
          ctx.drawImage(targetImg, 0, 0, width, height);
          ctx.restore();
        }

        // 3. Add Mandatory AI Watermark Badge
        ctx.save();
        const badgeW = 260;
        const badgeH = 42;
        const badgeX = width - badgeW - 28;
        const badgeY = height - badgeH - 28;

        ctx.fillStyle = 'rgba(9, 13, 24, 0.92)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.arc(badgeX + 22, badgeY + 21, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
        ctx.fillText('WINER AI • SWAP', badgeX + 42, badgeY + 26);
        ctx.restore();

        const dataUrl = canvas.toDataURL('image/png', 0.95);
        resolve(dataUrl);
      } catch (err) {
        console.warn('Canvas blending fallback to SVG:', err);
        resolve(generateSeamlessFaceSwapSvg(targetUrl, sourceUrl, options));
      }
    };

    targetImg.onload = () => {
      targetLoaded = true;
      if (sourceLoaded) onBothLoaded();
    };
    targetImg.onerror = () => {
      resolve(generateSeamlessFaceSwapSvg(targetUrl, sourceUrl, options));
    };

    sourceImg.onload = () => {
      sourceLoaded = true;
      if (targetLoaded) onBothLoaded();
    };
    sourceImg.onerror = () => {
      resolve(generateSeamlessFaceSwapSvg(targetUrl, sourceUrl, options));
    };

    targetImg.src = targetUrl;
    sourceImg.src = sourceUrl;
  });
}
