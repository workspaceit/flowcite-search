const app = require('./app');
const http = require('http');

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 8000;

const server = http.createServer(app);

server.on('close', () => {});

server.on('error', () => {});

server.on('listening', () => {
  console.log('listening', server.address());
});

server.listen(port, host);

process.on('SIGTERM', () => {
  server.close((err) => {
    if (err) {
      process.exit(1);
    }

    process.exit(0);
  });
});
