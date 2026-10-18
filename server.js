const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const CONTENT_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// Middleware: logs every incoming request, then passes control on
function logger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}

function sendNotFound(res) {
  res.writeHead(404, { "Content-Type": "text/html" });
  res.end("<h1>404 - Page Not Found</h1><p><a href=\"/\">Back to Home</a></p>");
}

function handleRequest(req, res) {
  // Ignore query strings, e.g. /about.html?x=1
  const urlPath = req.url.split("?")[0];

  // Build the file path from the request URL
  let filePath;
  if (urlPath === "/" || urlPath === "/index.html") {
    filePath = path.join(PUBLIC_DIR, "index.html");
  } else if (urlPath === "/about.html") {
    filePath = path.join(PUBLIC_DIR, "about.html");
  } else {
    // Other assets (css, images); blocked if they escape the public folder
    filePath = path.join(PUBLIC_DIR, path.normalize(urlPath));
    if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
      return sendNotFound(res);
    }
  }

  // Read the file asynchronously
  fs.readFile(filePath, (err, content) => {
    if (err) {
      return sendNotFound(res); // file missing -> 404
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(content, "binary");
  });
}

const server = http.createServer((req, res) => {
  logger(req, res, () => handleRequest(req, res));
});

server.on("error", (err) => {
  console.error("Server error:", err.message);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
