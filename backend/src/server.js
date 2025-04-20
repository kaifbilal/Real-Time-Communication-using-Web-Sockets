const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const auctionItems = require('./auctionitems.js');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

const bidHistory = [];

// Create a http server
const server = http.createServer(app);
// create a websocket server
const wss = new WebSocket.Server({server});

// WebSockets connection handler
wss.on("connection", (ws) => {
    console.log("New client connected");
    ws.send(JSON.stringify(auctionItems));
    ws.on("close", () => {
        console.log("Client disconnected");
    });
});


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/auctionitems', (req, res) => {
    res.status(200).json(auctionItems);
});

app.get('/auctionitems/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const item = auctionItems.find(item => item.id === id);
    if (item) {
        res.status(200).json(item);
    } else {
        res.status(404).json({ error: 'Item not found' });
    }
});

app.post('/api/bids', (req, res) => {
    const { itemId, bidAmount, bidder } = req.body;
    if (!itemId || !bidAmount || !bidder) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const foundItem = auctionItems.find(item => item.id === parseInt(itemId));

    if (!foundItem) {
        return res.status(404).json({ error: 'Item not found' });
    }

    if (parseInt(bidAmount) <= foundItem.currentBid) {
        return res.status(400).json({ error: 'Bid amount must be higher than current bid' });
    }
   foundItem.currentBid = parseInt(bidAmount);
   const newBid = {
    id: bidHistory.length + 1,
    itemId: parseInt(itemId), 
    bidder,
    amount: parseInt(bidAmount),
    timeStamp: new Date().toISOString(), 
   };
   
   foundItem.bids.push(newBid);
   bidHistory.push(newBid);

   res.status(201).json(newBid);
});

server.listen(PORT, () => {
    console.log(`Server UP & Running on port ${PORT}`);
    console.log(`Websocket server running on ws://localhost:${PORT}`);
    console.log(`Rest API running on http://localhost:${PORT}`);
});

