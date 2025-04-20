// Only using this file to practice WebSocket server implementation

const http = require('http');
const WebSocket = require('ws');

const PORT = 3001;


// Create a http server
const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('WebSocket server is running\n');
});
// create a websocket server
const wss = new WebSocket.Server({server});

// WebSockets connection handler
wss.on("connection", (ws) => {
    console.log("New client connected");
    ws.send(JSON.stringify("Welcome to the WebSocket server!"));
    ws.on("close", () => {
        console.log("Client disconnected");
    });
});


server.listen(PORT, () => {
    console.log(`WebSocket server is listening on port ${PORT}`);
    console.log(`WebSocket server is running at ws://localhost:${PORT}`);
});