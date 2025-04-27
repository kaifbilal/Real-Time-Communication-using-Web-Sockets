import React, {useState}  from "react";
import styled from "styled-components";
import { AuctionItem } from "../types/auction";
import { placeBid } from "../services/api";
import  webSocketService  from "../services/websocketService";

const DetailContainer = styled.div`
flex: 1;
background-color: #f8ff9fa;
padding: 20px;
border-radius: 4px;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;
const ItemName = styled.h2`
color: #2c3e50;
margin-top  
margin-bottom: 10px;
`;

const ItemHeader = styled.div`
border-bottom: 1px solid #ddd;
padding-bottom: 10px;
margin-bottom: 20px;
`;  

const ItemDescription = styled.p`
color: #34495e;
margin-bottom: 20px;
`;

const BidInfo = styled.div`
margin-bottom: 20px;
`;

const CurrentBid = styled.div`
font-size: 18px;
font-weight: bold;
color: #27ae60;
margin-bottom: 10px;
`;

const StartingBid = styled.div` 
color: #e67e22;
font-size: 16px;
font-weight: bold;
`;

const BidForm = styled.form`
display: flex;
flex-direction: column;
margin-top: 20px;
`;

const BidInput = styled.input`
padding: 10px;
border: 1px solid #ccc;
border-radius: 4px;
margin-bottom: 10px;
font-size: 16px;
`;

const BidButton = styled.button<{isRest: boolean}>`
background-color: ${({isRest}) => (isRest ? '#e74c3c' : '#3498db')};
color: white;
padding: 10px;
border: none;
border-radius: 4px;
cursor: pointer;

trans ition: background-color 0.3s ease, opacity 0.3s ease;
font-size: 16px;
&:hover {
    opacity: 0.8;
}
&:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}
`;

const BidHistory = styled.div`
margin-top: 20px;
`;

const BidHistoryTitle = styled.h3`
color: #2c3e50;
border-bottom: 1px solid #ddd;
padding-bottom: 10px;
margin-bottom: 10px;
`

const BidList = styled.ul`

  list-style-type: none;
  padding: 0;
  max-height: 300px;
  overflow-y: auto;
`;

const BidItem = styled.li`
  padding: 10px;
  border-bottom: 1px solid #ddd;
  &:last-child {
    border-bottom: none;
  }
  color: #34495e;
`;

const BidAmount = styled.span`
  color: #16a085;
  font-weight: bold;
`;

const BidderName = styled.span`
    color: #2980b9;
    `;

const BidTime = styled.span`
    color: #7f8c8d;
    font-size: 12px;
    float: right;
    `;

const ErrorMessage = styled.div`
padding: 10px;
background-color: #f8d7da;
color: #721c24;
border-radius: 4px;
margin-bottom: 20px;
`;

interface AuctionDetailProps {
    item: AuctionItem;
    bidderName: string;
    websocketConnected: boolean;
}


const AuctionDetail: React.FC<AuctionDetailProps> = ({
     item, 
     bidderName, 
     websocketConnected }) => {
    const [bidAmount, setBidAmount] = useState<string>(
        (item.currentBid + 10).toString()
    );
    const [isPlacingBid, setIsPlacingBid] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleTimeString();
    };

    const handleBidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBidAmount(e.target.value);
    };

// Place a bid using a Rest API call
    const handleRestBid = async (e: React.FormEvent) => {
        e.preventDefault();


        const bidValue = parseFloat(bidAmount);
        if (isNaN(bidValue) || bidValue <= item.currentBid) {
            setError("Bid amount must be greater than the current bid.");
            return;
        }

        try {
            setIsPlacingBid(true);
            setError(null);

            await placeBid(item.id, bidValue, bidderName);

            setBidAmount((item.currentBid + 10).toString());
        } catch (err){

            setError("An error occurred while placing the bid.");

        } finally {
            setIsPlacingBid(false); 
        }
     };

    // Place a bid using WebSocket
    const handleWebSocketBid = (e: React.FormEvent) => {
        e.preventDefault();

        const bidValue = parseFloat(bidAmount);
        if (isNaN(bidValue) || bidValue <= item.currentBid) {
            setError("Bid amount must be greater than the current bid.");
            return;
        }
        try{
            setIsPlacingBid(true);
            setError(null);

            webSocketService.sendBid(item.id, bidValue, bidderName);
            setBidAmount((item.currentBid + 10).toString());
            setIsPlacingBid(false);

        } catch (err) {
            console.error("An error occurred while placing the bid:", err);
            setError("Failed to place bid. Please try again later.");
            setIsPlacingBid(false);
        }
    };
    return (
        <DetailContainer>
            <ItemHeader>
                <ItemName>{item.name}</ItemName>
                <ItemDescription>{item.description}</ItemDescription>
            </ItemHeader>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <BidInfo>
                <CurrentBid>Current Bid: ${item.currentBid.toFixed(2)}</CurrentBid>
                <StartingBid>Starting Bid: ${item.startingBid.toFixed(2)}</StartingBid>
            </BidInfo>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            <BidForm onSubmit={websocketConnected ? handleWebSocketBid : handleRestBid}>
                <BidInput
                    type="number"
                    value={bidAmount}
                    onChange={handleBidAmountChange}
                    placeholder="Enter your bid amount"
                    disabled={!websocketConnected || isPlacingBid}
                />
                <BidButton type="submit" isRest={!websocketConnected} disabled={!websocketConnected || isPlacingBid}>
                    {isPlacingBid ? "Placing Bid..." : "Place Bid"}
                </BidButton>
            </BidForm>
            <BidHistory>
                <BidHistoryTitle>Bid History</BidHistoryTitle>
                <BidList>
                    {item.bids.map((bid) => (
                        <BidItem key={bid.id}>
                            <BidderName>{bid.bidder}</BidderName>:{" "}
                            <BidAmount>${bid.amount.toFixed(2)}</BidAmount>{" "}
                            <BidTime>{formatDate(bid.timestamp)}</BidTime>
                        </BidItem>
                    ))}
                </BidList>
            </BidHistory>
        </DetailContainer>
    )
};


export default AuctionDetail;