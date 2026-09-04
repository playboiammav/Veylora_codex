const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Normalize URL path: strip query string and trailing slash (except root)
  let rawUrl = req.url.split('?')[0];
  let urlPath = rawUrl.toLowerCase();
  if (urlPath.length > 1 && urlPath.endsWith('/')) {
    urlPath = urlPath.slice(0, -1);
  }

  let filePath = null;

  if (urlPath === '/' || urlPath === '/index.html' || urlPath === '/privacy-policy' || urlPath === '/privacy-policy.html' || urlPath === '/assets/privacy-policy.html') {
    filePath = path.join(__dirname, 'assets', 'privacy-policy.html');
  } else if (urlPath === '/data-deletion' || urlPath === '/data-deletion.html' || urlPath === '/assets/data-deletion.html') {
    filePath = path.join(__dirname, 'assets', 'data-deletion.html');
  } else {
    const cleanPath = rawUrl.startsWith('/') ? rawUrl.substring(1) : rawUrl;
    const candidate1 = path.join(__dirname, cleanPath);
    const candidate2 = path.join(__dirname, 'assets', path.basename(cleanPath));
    if (fs.existsSync(candidate1) && fs.statSync(candidate1).isFile()) {
      filePath = candidate1;
    } else if (fs.existsSync(candidate2) && fs.statSync(candidate2).isFile()) {
      filePath = candidate2;
    }
  }

  if (filePath && fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
    };
    const contentType = mimeTypes[ext] || 'text/html; charset=utf-8';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Length': Buffer.byteLength(content),
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600'
        });
        if (req.method === 'HEAD') {
          res.end();
        } else {
          res.end(content);
        }
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!DOCTYPE html><html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1></body></html>');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
