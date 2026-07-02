const net = require('net');
const http = require('http');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Proxy is running');
});

server.on('connect', (req, clientSocket, head) => {
  const [hostname, port] = req.url.split(':');
  const serverSocket = net.connect(parseInt(port) || 443, hostname, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\nProxy-agent: n8n-proxy\r\n\r\n');
    if (head) serverSocket.write(head);
    serverSocket.pipe(clientSocket, { end: true });
    clientSocket.pipe(serverSocket, { end: true });
  });
  serverSocket.on('error', () => clientSocket.end());
  clientSocket.on('error', () => serverSocket.end());
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`CONNECT proxy running on port ${PORT}`);
});
