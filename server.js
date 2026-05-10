import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, join, resolve } from "node:path";

const distDir = resolve(process.cwd(), "dist");
const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? "0.0.0.0";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function fileExists(filePath) {
  try {
    const stats = await stat(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
}

async function sendFile(res, filePath) {
  const contentType = mimeTypes[extname(filePath)] ?? "application/octet-stream";
  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": "no-cache",
  });
  createReadStream(filePath).pipe(res);
}

async function sendIndex(res) {
  const indexPath = join(distDir, "index.html");
  const html = await readFile(indexPath, "utf8");
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-cache",
  });
  res.end(html);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? host}`);
    let pathname = decodeURIComponent(url.pathname);

    if (pathname === "/") {
      await sendIndex(res);
      return;
    }

    const assetPath = resolve(distDir, `.${pathname}`);
    if (assetPath.startsWith(distDir) && (await fileExists(assetPath))) {
      await sendFile(res, assetPath);
      return;
    }

    await sendIndex(res);
  } catch (error) {
    console.error("Request handling failed:", error);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Internal Server Error");
  }
});

server.listen(port, host, () => {
  console.log(`Production server listening on http://${host}:${port}`);
});
