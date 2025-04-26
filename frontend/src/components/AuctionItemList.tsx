import styled from 'styled-components';
import { AuctionItem } from '../types/auction';

const ListContainer = styled.div`
width: 30%;
min-width: 300px;
background-color: #f9f9f9;
border-radius: 4px;
padding: 15px;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ListTitle = styled.h2`
color : #2x3e50;
margin-top: 0;
padding-bottom: 10px;
border-bottom: 2px solid #2c3e50;
`;

const ItemsList = styled.ul`
list-style-type: none;
padding: 0;
margin: 0;
`

const ItemCard = styled.li<{selected: boolean}>`
padding: 10px;
margin-bottom: 10px;
border-radius: 4px;
cursor: pointer;
background-color: ${(props) => props.selected ? '#2c3e50' : '#ffffff'};
color: ${(props) => props.selected ? '#ffffff' : 'inherit'};
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
transition: all 0.2s ease;
&:hover {
transform: translateY(-2px);
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
`

const ItemName = styled.h3`
margin: 0 0 5px 0; 
font-size: 12px;

`;

const ItemPrice = styled.div`
font-weight: bold;
color: inherit;
`;

const LoadingSpinner = styled.div`
text-align: center;
padding: 20px;
color: #7f8c8d;
`;

const ItemDescription = styled.p`
font-size: 12px;
`;


type AuctionItemListProps = {
    items: AuctionItem[];
    isLoading: boolean;
    selectiedItemId?: number;
    onSelectItem: (item: AuctionItem) => void;

};

const AuctionItemList: React.FC<AuctionItemListProps> = ({ items, isLoading, selectiedItemId, onSelectItem }) => {
    if ( isLoading) {
        return (
            <ListContainer> 
                <ListTitle>Auction Items</ListTitle>
                <LoadingSpinner>Loading...</LoadingSpinner>
            </ListContainer>
        );
    }
    return (
        <ListContainer>
            <ListTitle>Auction Items</ListTitle>
            {items.length === 0 ? (
                <p>No items available</p>
            ):(
                <ItemsList>
                    {items.map((item) => (
                        <ItemCard key={item.id} selected={selectiedItemId === item.id} onClick={() => onSelectItem(item)}>
                            <ItemName>{item.name}</ItemName>
                            <ItemDescription>{item.description}</ItemDescription>
                            <ItemPrice>Current Bid: ${item.currentBid}</ItemPrice>
                        </ItemCard>
                    ))}
                </ItemsList>
            ) }

        </ListContainer>
            
    );
}

export default AuctionItemList;