import React, { useState } from 'react';
import { Navbar, Container, Button, Badge, Alert } from 'react-bootstrap';
import { useWeb3 } from '../contexts/Web3Context';

const Header = () => {
  const { account, connectWallet, disconnectWallet, isOwner, formatAddress } = useWeb3();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setError('');
      setLoading(true);
      await connectWallet();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setError('');
      setLoading(true);
      await disconnectWallet();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
                  onClick={handleDisconnect}
                  disabled={loading}
                >
                  {loading ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              </div>
            ) : (
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleConnect}
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      {error && (
        <Container className="mt-3">
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        </Container>
      )}
    </>
  );
};

export default Header; 