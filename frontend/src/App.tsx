import { useState } from 'react';
import styled from 'styled-components';
import {type AuctionItem} from './types/auction';
import AuctionItemList from './components/AuctionItemList';
import { fetchAllItems } from './services/api';
import { useEffect } from 'react';
import webSocketService from './services/websocketService';
import AuctionItemDetail from './components/AuctionDetail';




const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #e4e4e4;
  font-family: Arial, Helvetica, sans-serif;
`;

const Header = styled.header`
 background-color: #2c3e50;
 color: white;
 padding: 20px;
 border-radius: 4px;
 margin-bottom: 20px;
 text-align: center;
`;

const ConnectionStatus = styled.div<{connected: boolean}>`
display: inline-block;
padding: 5px 10px;
border-radius: 20px;
font-size: 14px;
margin-top: 10px;
background-color: ${props => props.connected ? '#2ecc71' : '#e74c3c'};
color: white;
`;

const MainContent = styled.div`
display: flex;
gap: 20px;

@media (max-width: 768px) {
  flex-direction: column;
}
`
const ErrorContent = styled.div`
padding: 10px;
background-color: #f8d7da;
color: #721c24;
border-radius: 4px;
margin-bottom: 20px;
`


const Footer = styled.footer`
text-align: center;
margin-top: 20px;
padding: 10px;
color: #cccccc;
font-size: 12px;
`;




function App() {
  const[items, setItems] = useState<AuctionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<AuctionItem | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [bidderName, setBidderName] = useState<string>('Anonymous');

  useEffect(() => {
    const loadItems = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAllItems();
        setItems(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching items:', error);
        setError('Failed to load auction items. Please try again later.');
        setIsLoading(false);
      }
    };

    loadItems();
  }, []);

  useEffect(() => {
    webSocketService.onConnect((connected) => {
      setIsConnected(connected);

      if (!connected) {
        setError('WebSocket connection lost. Please refresh the page.');
      } else {
        setError(null);
      }
    });

    webSocketService.onInitialData((items) => {
      setItems(items);
      if (!selectedItem && items.length > 0) {
        setSelectedItem(items[0]);
      }
    });
    webSocketService.onItemUpdate((updatedItem) => {
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );

      if (selectedItem && selectedItem.id === updatedItem.id) {
        setSelectedItem(updatedItem);
      }

      webSocketService.onError((message) => {
        setError(message);
        setTimeout(() => setError(null), 5000);
      });

      
    });

    webSocketService.connect();

    return () => {
        webSocketService.disconnect();
      };
  }, []);

  useEffect(() => {
    if (selectedItem) {
      const selected = items.find((item) => item.id === selectedItem.id);
      if (selected) {
        setSelectedItem(selected);
      }
    }
  }, [items, selectedItem]);

  const handleSelectItem = (item: AuctionItem) => {
    setSelectedItem(item);
  };

    const handleBidderNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setBidderName(event.target.value);
    };




  return (
    <AppContainer>
      <Header>
        <h1>Live Auction Platform</h1>
        <ConnectionStatus connected={isConnected}>
          {isConnected 
          ? 'Connected to Live Updates' : 'Disconnected - Please Refresh'}
        </ConnectionStatus>
      </Header>
      {error && <ErrorContent>{error}</ErrorContent>}
            <div style={{marginBottom: '20px'}}>
              <label htmlFor="bidderName" style={{ marginRight: "10px"}}>Your Name:{" "}</label>
              <input
              type="text"
              id="bidderName"
              value={bidderName}
              onChange={handleBidderNameChange}
              placeholder='Enter your name'
              style={{padding: '5px', width: '200px', borderRadius: '4px', border: '1px solid #ccc'}}
              />
            </div>

      
      <MainContent>
        <AuctionItemList
        items ={items} 
        isLoading={isLoading}
        selecteditemId={selectedItem?.id}
        onSelectItem={handleSelectItem}
        />

        {
          selectedItem && (
            <AuctionItemDetail
            item={selectedItem}
            bidderName={bidderName}
            websocketConnected={isConnected}

            />
          )
        }


      </MainContent>
      <Footer>
        <p>All rights reserved &copy; 2023</p>
      </Footer>
    </AppContainer>
  )
}

export default App;
