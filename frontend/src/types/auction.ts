export type Bid = {
    id: number;
    itemId: number;
    bidder: string;
    amount: number;
    timestamp: string;
}

export interface AuctionItem {
    id: number;
    name: string;
    description: string;
    startingBid: number;
    currentBid: number;
    bids: Bid[];
    auctionEndTime: string; // ISO 8601 format
}


export interface WebSocketMessage {
    type: "INITIAL_DATA" | "BID_UPDATE" | "NEW_BID" | "ERROR" |
    "HEARTBEAT";
    items?: AuctionItem[]; 
    item?: AuctionItem;
    bid?: Bid;
    message?: string;
}