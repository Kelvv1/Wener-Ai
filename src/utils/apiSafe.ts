/**
 * Safe API request handler that safely parses JSON and provides seamless
 * client-side fallback for static deployments (such as Vercel) where Express backend is not active.
 */

export async function safeFetchJson<T = any>(url: string, options: RequestInit = {}): Promise<{
  ok: boolean;
  status: number;
  data: T | null;
}> {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    let data: any = null;

    if (text && text.trim().startsWith('{')) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    } else if (text && text.trim().startsWith('[')) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }

    if (!data) {
      return {
        ok: false,
        status: res.status || 404,
        data: null,
      };
    }

    return {
      ok: res.ok,
      status: res.status,
      data,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: null,
    };
  }
}

// Sample fallback creations with high quality AI imagery
export const SAMPLE_AI_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&auto=format&fit=crop&q=80',
];

export const SAMPLE_AI_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
];
