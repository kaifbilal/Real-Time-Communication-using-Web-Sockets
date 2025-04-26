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




