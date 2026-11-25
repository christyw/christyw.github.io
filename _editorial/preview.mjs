import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = process.cwd();
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.xml': 'application/xml', '.jpg': 'image/jpeg', '.txt': 'text/plain; charset=utf-8'
};

http.createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (path.split('/').some(part => /^[_.]/.test(part))) throw new Error('Source file');
    let file = resolve(root, '.' + path);
    if (!file.startsWith(root + sep) && file !== root) throw new Error('Invalid path');
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    const type = types[extname(file)];
    if (!type) throw new Error('Unsupported file');
    const contents = await readFile(file);
    response.writeHead(200, {'Content-Type': type});
    response.end(contents);
  } catch {
    response.writeHead(404, {'Content-Type': types['.html']});
    response.end(await readFile(resolve(root, '404.html')));
  }
}).listen(Number(process.env.PORT || 3000), '0.0.0.0', () => {
  console.log('Editorial preview ready on port ' + (process.env.PORT || 3000));
});
