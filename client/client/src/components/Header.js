import React from 'react';
import { useWeb3 } from '../contexts/Web3Context';

const Header = () => {
  const { isConnected, account, connectWallet, disconnectWallet } = useWeb3();

  // Helper function to truncate the address for display
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <a className="navbar-brand" href="/">Premium Training Auctions</a>
        
        <div className="ms-auto">
          {isConnected ? (
            <div className="d-flex align-items-center">
              <span className="text-light me-3">
                Connected: {truncateAddress(account)}
              </span>
              <button
                className="btn btn-outline-danger"
                onClick={disconnectWallet}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header; 