
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

const server = createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Handle the root path
  let filePath = req.url === '/' 
    ? join(__dirname, 'dist', 'index.html')
    : join(__dirname, 'dist', req.url);
  
  const extname = String(filePath.split('.').pop()).toLowerCase();
  const contentType = MIME_TYPES[`.${extname}`] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Try to serve index.html for client-side routing
        fs.readFile(join(__dirname, 'dist', 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(404);
            res.end('Page not found');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
});
