import { AuctionItem, Bid, WebSocketMessage } from '../types/auction';

const HEARTBEAT_INTERVAL = 5000;
const RECONNECT_INTERVAL = 3000; // 3 seconds

// WebSocket server URL
const WS_URL = 'ws://localhost:3000/'; // Update with your server URL

class WebSocketService {
// Websocket connection instance
    private socket: WebSocket | null = null;

    // Callback functions for different event types
    private connectionsCallbacks: ((connected: boolean) => void)[] = [];
    private itemUpdateCallbacks: ((item: AuctionItem) => void)[] = [];
    private bigUpdateCallbacks: ((bid: Bid) => void)[] = [];
    private initialDataCallbacks: ((items: AuctionItem[]) => void)[] = [];
    private errorCallbacks: ((message: string) => void)[] = [];
    
    // Timer reference for cleanup
    private heartbeatInterval: number | null = null;
    private reconnectTimeout: number | null = null;

    private intentionalClosure = false;




    // Connect to the WebSocket server
    // This is the main function to establish a connection
    connect() {
        // Clear any existing reconnect attempt
        if (this.reconnectTimeout){
            window.clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }


        // Don't try to connect if already connected or connecting
        if (
            this.socket && 
            (this.socket.readyState === WebSocket.OPEN || 
            this.socket.readyState === WebSocket.CONNECTING)
        ) {
            return;
        }

        this.intentionalClosure = false;
        this.socket = new WebSocket(WS_URL);


        this.socket.onopen = () => {
            console.log("WebSocket connected");
            this.notifyConnectionChange(true);
            this.setupHeartbeat();
        };

        this.socket.onmessage = (event) => {
            try{
                const data: WebSocketMessage = JSON.parse(event.data);

                if (data.type === "HEARTBEAT") {
                    // Handle heartbeat message if needed
                    return;
                }

                switch (data.type){
                    case "INITIAL_DATA":
                        if (data.items) {
                            const items = data.items;
                            this.initialDataCallbacks.forEach(callback => callback(items));
                        }
                        break;

                    case "BID_UPDATE":
                        if (data.item) {
                            const item = data.item;
                            this.itemUpdateCallbacks.forEach(callback => callback(item));
                        }
                        if (data.bid) {
                            const bid = data.bid;
                            this.bigUpdateCallbacks.forEach(callback => callback(bid));
                        }
                        break;

                    case "NEW_BID":
                        if (data.bid) {
                            const bid = data.bid;
                            this.bigUpdateCallbacks.forEach(callback => callback(bid));
                        }
                        break;

                    case "ERROR":
                        if (data.message) {
                            const message = data.message;
                            this.errorCallbacks.forEach(callback => callback(message));
                        }
                        break;
                
                }
            } catch (error) {
                console.error("Failed to parse WebSocket message:", error);
            }
        }
    
    this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.notifyConnectionChange(false);
    };

    this.socket.onclose = (event) => {
        console.log(
            `WebSocket closed with code: ${event.code}, reason: ${event.reason}`
        );
        this.clearHeartbeat();
        this.notifyConnectionChange(false);
        if (!this.intentionalClosure) {
            this.scheduleReconnect();
        }
    };
    }


    setupHeartbeat() {
        this.clearHeartbeat();

        this.heartbeatInterval = window.setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                try {
                    this.socket.send(JSON.stringify({ type: "HEARTBEAT" }));
                } catch (error) {
                    console.error("Failed to send heartbeat:", error);
                    this.notifyConnectionChange(false);
                    this.scheduleReconnect();
                }
            } else {
                this.notifyConnectionChange(false);
                this.scheduleReconnect();
            }
            
        }, HEARTBEAT_INTERVAL);
    }

    clearHeartbeat() {
        if (this.heartbeatInterval !== null) {
            window.clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    scheduleReconnect() {
        if (this.reconnectTimeout && !this.intentionalClosure) {
            this.reconnectTimeout = window.setTimeout(() => {
                console.log("Reconnecting to WebSocket server...");
                this.reconnectTimeout = null;
                this.connect();
            }, RECONNECT_INTERVAL);
        };
    }

    disconnect() {
        this.intentionalClosure = true;
        this.clearHeartbeat();

        if (this.reconnectTimeout) {
            window.clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        // Close the WebSocket connection if it exists
        if (this.socket) {
            if (
                this.socket.readyState === WebSocket.OPEN ||
                this.socket.readyState === WebSocket.CONNECTING
            ) {
            this.socket.close();
            }
            this.socket = null;
        }
        this.notifyConnectionChange(false);
    }

    sendBid(itemId: number, bidAmount: number, bidder: string) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(
                JSON.stringify({
                    type: "NEW_BID",
                    bid: {
                        itemId,
                        bidAmount,
                        bidder,
                    },
                })
            );
        } else {
            this.notifyConnectionChange(false);
            this.errorCallbacks.forEach(callback => callback("WebSocket is not connected. Unable to send bid."));
        };
        this.scheduleReconnect();
    }


    onConnect(callback: (connedted: boolean) => void) {
        this.connectionsCallbacks.push(callback);
        if (this.socket) {
            const isConnected = this.socket.readyState === WebSocket.OPEN;
            callback(isConnected);
        } else {
            callback(false);
        }
    }


    notifyConnectionChange(connected: boolean) {
        this.connectionsCallbacks.forEach(callback => callback(connected));
    }

    onItemUpdate(callback: (item: AuctionItem) => void) {
        this.itemUpdateCallbacks.push(callback);
    }
    onBidUpdate(callback: (bid: Bid) => void) {
        this.bigUpdateCallbacks.push(callback);
    } 

    onInitialData(callback: (items: AuctionItem[]) => void) {
        this.initialDataCallbacks.push(callback);
    }
    onError(callback: (message: string) => void) {
        this.errorCallbacks.push(callback);
    }
    isConnected(): boolean {
        return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
    }
}


const webSocketService = new WebSocketService();
export default webSocketService;