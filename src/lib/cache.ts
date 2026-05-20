import "server-only";

/**
 * Purge specific paths from Cloudflare cache.
 * No-op when env vars are not set (e.g. local dev).
 */
export async function purgeCloudflarePaths(paths: string[]) {
  const zone = process.env.CLOUDFLARE_ZONE_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const site = process.env.SITE_URL;
  if (!zone || !token || !site) return;

  const files = paths.map((p) => `${site}${p}`);
  try {
    await fetch(`https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ files }),
    });
  } catch (err) {
    console.error("Cloudflare purge failed", err);
  }
}
