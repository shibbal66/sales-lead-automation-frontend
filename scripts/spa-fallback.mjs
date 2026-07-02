import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const distDir = "dist";
const indexPath = join(distDir, "index.html");
const fallbackPath = join(distDir, "404.html");

copyFileSync(indexPath, fallbackPath);
console.log("SPA fallback: copied dist/index.html -> dist/404.html");

const apiBase = (process.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
if (!apiBase) {
  console.warn(
    "SPA fallback: VITE_API_BASE_URL is not set — skipping Calendly static callback page"
  );
} else {
  const callbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Connecting Calendly…</title>
  <script>
    window.location.replace(${JSON.stringify(apiBase + "/auth/calendly/callback")} + window.location.search);
  </script>
</head>
<body>
  <p>Completing Calendly connection…</p>
</body>
</html>`;

  const callbackDir = join(distDir, "auth/calendly/callback");
  mkdirSync(callbackDir, { recursive: true });
  writeFileSync(join(callbackDir, "index.html"), callbackHtml);
  console.log("SPA fallback: wrote dist/auth/calendly/callback/index.html");
}

const integrationsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Redirecting…</title>
  <script>
    var params = new URLSearchParams(window.location.search);
    params.set("tab", "social");
    window.location.replace("/settings?" + params.toString());
  </script>
</head>
<body>
  <p>Redirecting to settings…</p>
</body>
</html>`;

const integrationsDir = join(distDir, "settings/integrations");
mkdirSync(integrationsDir, { recursive: true });
writeFileSync(join(integrationsDir, "index.html"), integrationsHtml);
console.log("SPA fallback: wrote dist/settings/integrations/index.html");
