import { use, useState } from 'react';
import styled from 'styled-components';
import {type AuctionItem} from './types/auction';
import AuctionItemList from './components/AuctionItemList';
import { fetchAllItems } from './services/api';
import { useEffect } from 'react';




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
    if (selectedItem) {
      const updatedSelectedItem = items.find(item => item.id === selectedItem.id);
      if (updatedSelectedItem) {
        setSelectedItem(updatedSelectedItem);
      }
    }
  }, [selectedItem, items]);

  const handleSelectItem = (item: AuctionItem) => {
    setSelectedItem(item);
  };




  return (
    <AppContainer>
      <Header>
        <h1>Live Auction Platform</h1>
      </Header>
      {error && <ErrorContent>{error}</ErrorContent>}
      
      <MainContent>
        <AuctionItemList
        items ={items} 
        isLoading={isLoading}
        selecteditemId={selectedItem?.id}
        onSelectItem={handleSelectItem}
        />
      </MainContent>
      <Footer>
        <p>All rights reserved &copy; 2023</p>
      </Footer>
    </AppContainer>
  )
}

export default App;
