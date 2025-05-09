import React from 'react';
import { Navbar, Container, Button, Badge } from 'react-bootstrap';
import { useWeb3 } from '../contexts/Web3Context';

const Header = () => {
  const { account, connectWallet, disconnectWallet, isOwner } = useWeb3();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand href="#home">
          Training Spot Auctions
          {isOwner && (
            <Badge bg="warning" text="dark" className="ms-2">
              Admin
            </Badge>
          )}
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          {account ? (
            <div className="d-flex align-items-center">
              <span className="text-light me-3">
                {formatAddress(account)}
              </span>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={disconnectWallet}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button 
              variant="primary" 
              size="sm"
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header; 