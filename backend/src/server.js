/*
* Live Auction Platform - Backend Server
*/
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const auctionItems = require('./auctionitems.js');

// initialize express app
const app = express();


// Middleware
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Global bid history Storage
const bidHistory = [];

// Create a http server by using the express instance
const server = http.createServer(app);
// create a websocket server and attach it to the http server
// This allows us to use the same server for both HTTP and WebSocket connections
const wss = new WebSocket.Server({server});



// ======================== REST API ROUTES =========================
// These routes demonstrate http request/response communication


app.get('/', (req, res) => {
    res.send('Hello World!');
});

// GET /autionitems - Get all auction items
app.get('/auctionitems', (req, res) => {
    res.status(200).json(auctionItems);
});

// GET /auctionitems/:id - Get a specific auction item by ID
app.get('/auctionitems/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const item = auctionItems.find(item => item.id === id);
    if (item) {
        res.status(200).json(item);
    } else {
        res.status(404).json({ error: 'Item not found' });
    }
});


// POST /api/bids - Place a new bid on an auction item

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

// GET /history - Get the bid history
// This route returns the bid history for all items
app.get("/history", (req, res) => {
    res.status(200).json(bidHistory);

});


/**
 * ========================= WebSocket Handling Server =========================
* This section sets up the WebSocket server and handles incoming connections and messages
* It also broadcasts updates to all connected clients
*/


// WebSocket connection handler
wss.on("connection", (ws) => {
    console.log("New client connected");

    // Send current auction items to the client
    ws.send(JSON.stringify({ type: "INITIAL_DATA",
        items: auctionItems,
     }));

    // Handle incoming messages from clients
    ws.on("message", async (message) => {
        try {
            const data = JSON.parse(message);
            // Handdle Real time bid updates
            if (data.type === "NEW_BID") {
               const {itemId, bidAmount, bidder} = data;
            if (!itemId || !bidAmount || !bidder) {
                return ws.send(JSON.stringify({ type: "MiSSING_FIELDS",
                    error: 'Missing required fields' }));
            }
        }

        const foundItem = auctionItems.find(item => item.id === parseInt(itemId));
        if (!foundItem) {
            return ws.send(JSON.stringify({ type: "ITEM_NOT_FOUND",
                error: 'Item not found' }));
        }

        if(parseInt(bidAmount) <= foundItem.currentBid){
            return ws.send(JSON.stringify({ type: "BID_TOO_LOW",
                error: 'Bid amount must be higher than current bid' }));
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


        // Broadcast the new bid to all connected clients
        broadcastBidUpdate(foundItem, newBid);

        } catch (error) {
            console.error("Error processing message:", error);
            ws.send(JSON.stringify({ error: "Error processing message" }));
        }

    });

    // Handle client disconnection
    ws.on("close", () => {
        console.log("Client disconnected", ws);
    });
});

// Broadcast updates to all connected clients
// Utility function to send messages to all connected clients
// this is used to get all cliednts in sync

function broadcastBidUpdate(item, bid) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(
                JSON.stringify({
                    type: "BIG_UPDATE",
                    item: item,
                    bid: bid
                })
            );
        }
    });
};


// Start the server - listen on the specified port
// it listens to http and websocket connections
server.listen(PORT, () => {
    console.log(`Server UP & Running on port ${PORT}`);
    console.log(`Websocket server running on ws://localhost:${PORT}`);
    console.log(`Rest API running on http://localhost:${PORT}`);
});

