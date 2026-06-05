import { copyFileSync } from "node:fs";
import { join } from "node:path";

const distDir = "dist";
const indexPath = join(distDir, "index.html");
const fallbackPath = join(distDir, "404.html");

copyFileSync(indexPath, fallbackPath);
console.log("SPA fallback: copied dist/index.html -> dist/404.html");
