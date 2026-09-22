/**
 * API Configuration & Multi-Environment Endpoint Resolver
 * Ensures cross-device synchronization works on Cloud Run, Netlify, Vercel, and local previews.
 */

export const CLOUD_RUN_BACKEND_URL = "https://ais-pre-lasu42ssoiodei7unqrifo-448865184544.us-east5.run.app";

/**
 * Returns the best API base URL according to current execution environment
 */
export function getApiBaseUrl(): string {
  if (typeof window === "undefined") return "";

  const hostname = window.location.hostname;

  // If running on Netlify, GitHub Pages, or external static hosts without local backend
  if (
    hostname.includes("netlify.app") ||
    hostname.includes("vercel.app") ||
    hostname.includes("github.io") ||
    hostname.includes("surge.sh")
  ) {
    return CLOUD_RUN_BACKEND_URL;
  }

  // Same-origin Cloud Run or local dev server
  return "";
}

/**
 * Resolves an API endpoint path
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${cleanPath}` : cleanPath;
}

/**
 * Robust fetch that handles fallback if a static host returns 404
 */
export async function fetchWithFallback(path: string, options?: RequestInit): Promise<Response> {
  const primaryUrl = getApiUrl(path);
  
  try {
    const res = await fetch(primaryUrl, options);
    // If not a 404, return response
    if (res.status !== 404) {
      return res;
    }
  } catch (err) {
    console.warn(`[API FETCH FAIL] Primary failed for ${primaryUrl}:`, err);
  }

  // If primary was relative and returned 404 (e.g. Netlify without proxy), fallback to Cloud Run direct
  if (!primaryUrl.startsWith("http")) {
    const fallbackUrl = `${CLOUD_RUN_BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
    return fetch(fallbackUrl, options);
  }

  throw new Error(`Failed to fetch from ${primaryUrl}`);
}
