var http = require('http');

http.createServer(function (request, response) {
response.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
});
response.end('Hello World\n');
}).listen(8080);
