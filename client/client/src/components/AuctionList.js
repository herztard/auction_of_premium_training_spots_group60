import React, { useState, useEffect } from 'react';
import { Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useWeb3 } from '../contexts/Web3Context';
import AuctionCard from './AuctionCard';

const AuctionList = () => {
  const { contract, account } = useWeb3();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      setError('');
      
      try {
        if (contract) {
          const activeAuctions = await contract.getActiveAuctions();
          setAuctions(activeAuctions.map(id => Number(id)));
        }
      } catch (error) {
        console.error('Error fetching auctions:', error);
        setError('Failed to load auctions. The contract might not be properly deployed.');
      } finally {
        setLoading(false);
      }
    };

    if (contract) {
      fetchAuctions();
    } else {
      setLoading(false);
    }
  }, [contract, account]);

  return (
    <div className="mb-5">
      <h2 className="text-center mb-4">Available Training Spots</h2>
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading auctions...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : !contract ? (
        <Alert variant="warning" className="text-center">
          Contract not properly initialized. Please make sure you're connected to the Sepolia network and the contract is deployed.
        </Alert>
      ) : auctions.length === 0 ? (
        <Alert variant="info" className="text-center">
          No active auctions available at the moment.
        </Alert>
      ) : (
        <Row>
          {auctions.map((tokenId) => (
            <Col key={tokenId} md={6} lg={4}>
              <AuctionCard tokenId={tokenId} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default AuctionList; 