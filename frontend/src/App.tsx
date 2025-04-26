import styled from 'styled-components';



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
        <div style={{ flex: 1 }}>
          <h2>Welcome to the Auction</h2>
          <p>Bid on your favorite items!</p>
        </div>
        <div style={{ flex: 1 }}>
          <h2>Current Auctions</h2>
          <p>Check out the ongoing auctions.</p>
        </div>
      </MainContent>
      <Footer>
        <p>All rights reserved &copy; 2023</p>
      </Footer>
    </AppContainer>
  )
}

export default App;
