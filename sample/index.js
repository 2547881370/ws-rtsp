var http = require('http');
var rtsp = require('../dist/Index');

var server = http.createServer(function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.end()
});
new rtsp.StreamingMediaServer(server);
server.listen(8080);