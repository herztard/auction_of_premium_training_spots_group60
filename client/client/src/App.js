import React from 'react';
import { Web3Provider } from './contexts/Web3Context';
import Header from './components/Header';
import AuctionList from './components/AuctionList';
import './App.css';

function App() {
  return (
    <Web3Provider>
      <div className="App">
        <Header />
        <main>
          <AuctionList />
        </main>
        <footer className="bg-dark text-light py-4 mt-5">
          <div className="container text-center">
            <p className="mb-0">&copy; {new Date().getFullYear()} Premium Training Auctions. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Web3Provider>
  );
}

export default App;
