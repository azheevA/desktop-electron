const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const vercelHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

function normalizeSiteUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

export const siteUrl = new URL(
  configuredUrl
    ? normalizeSiteUrl(configuredUrl)
    : vercelHost
      ? `https://${vercelHost}`
      : "http://localhost:3000",
);
