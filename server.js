const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const host = process.env.HOST || "127.0.0.1";
const port = Number.parseInt(process.env.PORT || "3000", 10);
const rootDir = __dirname;

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

const server = http.createServer(async (request, response) => {
  if (!request.url) {
    respond(response, 400, "Bad Request");
    return;
  }

  if (!["GET", "HEAD"].includes(request.method || "GET")) {
    respond(response, 405, "Method Not Allowed");
    return;
  }

  const requestUrl = new URL(request.url, `http://${request.headers.host || host}`);
  const safePath = resolvePath(requestUrl.pathname);

  if (!safePath) {
    respond(response, 403, "Forbidden");
    return;
  }

  try {
    const filePath = await resolveFilePath(safePath);
    const extension = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extension] || "application/octet-stream";
    const file = await fs.readFile(filePath);

    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": contentType,
    });
    response.end(file);
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      respond(response, 404, "Not Found");
      return;
    }

    console.error(error);
    respond(response, 500, "Internal Server Error");
  }
});

server.listen(port, host, () => {
  console.log(`Tool Researcher running at http://${host}:${port}`);
});

function resolvePath(urlPath) {
  let decodedPath = urlPath;

  try {
    decodedPath = decodeURIComponent(urlPath);
  } catch {
    return null;
  }

  const normalizedPath =
    decodedPath === "/"
      ? "index.html"
      : path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const relativePath = normalizedPath.replace(/^[/\\]+/, "");
  const absolutePath = path.resolve(rootDir, relativePath);

  if (absolutePath !== rootDir && !absolutePath.startsWith(`${rootDir}${path.sep}`)) {
    return null;
  }

  return absolutePath;
}

async function resolveFilePath(absolutePath) {
  const stats = await fs.stat(absolutePath);

  if (stats.isDirectory()) {
    return path.join(absolutePath, "index.html");
  }

  return absolutePath;
}

function respond(response, statusCode, message) {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "text/plain; charset=utf-8",
  });
  response.end(message);
}
