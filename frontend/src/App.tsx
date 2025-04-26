import styled from 'styled-components';
import AuctionItemList from './components/AuctionItemList';



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

const Footer = styled.footer`
text-align: center;
margin-top: 20px;
padding: 10px;
color: #cccccc;
font-size: 12px;
`;




function App() {
  return (
    <AppContainer>
      <Header>
        <h1>Live Auction Platform</h1>
      </Header>
      <MainContent>
        <AuctionItemList
          items={[
            {
              id: 1,
              name: 'Vintage Watch',
              description: 'A classic timepiece from the 1960s',
              startingBid: 100,
              currentBid: 100,
              bids: [],
              auctionEndTime: '2024-12-31T23:59:59Z',
          },
          {
              id: 2,
              name: 'Antique Vase',
              description: 'A beautiful vase from the Ming dynasty',
              startingBid: 150,
              currentBid: 150,
              bids: [],
              auctionEndTime: '2024-12-31T23:59:59Z',
          },
          {
              id: 3,
              name: 'Modern Art Painting',
              description: 'A stunning piece of contemporary art',
              startingBid: 200,
              currentBid: 200,
              bids: [],
              auctionEndTime: '2024-12-31T23:59:59Z',
            },
          ]}
          isLoading={false}
          selectiedItemId={1}
          onSelectItem={() => console.log('Item selected')}
        />
      </MainContent>
      <Footer>
        <p>All rights reserved &copy; 2023</p>
      </Footer>
    </AppContainer>
  )
}

export default App;
