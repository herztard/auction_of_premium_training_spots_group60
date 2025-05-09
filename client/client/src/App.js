import React from 'react';
import { Web3Provider } from './contexts/Web3Context';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import AuctionList from './components/AuctionList';
import AdminPanel from './components/AdminPanel';
import MyTrainingSpots from './components/MyTrainingSpots';
import './App.css';

function App() {
  return (
    <Web3Provider>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        
        <main className="flex-grow-1 py-4">
          <Container>
            <AdminPanel />
            <MyTrainingSpots />
            <AuctionList />
          </Container>
        </main>
        
        <footer className="bg-dark text-white py-4">
          <Container className="text-center">
            <p className="mb-1">&copy; {new Date().getFullYear()} INF 392 Blockchain, Group 60 </p>
          </Container>
        </footer>
      </div>
    </Web3Provider>
  );
}

export default App;
