import React, { useState, useEffect } from 'react';
import { Card, Alert, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';

const MyTrainingSpots = () => {
  const { contract, account } = useWeb3();
  const [trainingSpots, setTrainingSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserTrainingSpots = async () => {
      if (!contract || !account) {
        setTrainingSpots([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const tokenIds = await contract.getTokensOfOwner(account);
        
        if (tokenIds.length === 0) {
          setTrainingSpots([]);
          setLoading(false);
          return;
        }

        const spotPromises = tokenIds.map(async (tokenId) => {
          const spotData = await contract.getTrainingSpotData(tokenId);
          
          return {
            tokenId: Number(tokenId),
            coachName: spotData[0],
            trainingDate: Number(spotData[1]),
            description: spotData[2],
            location: spotData[3],
            imageUrl: spotData[4]
          };
        });

        const spots = await Promise.all(spotPromises);
        setTrainingSpots(spots);
      } catch (error) {
        console.error('Error fetching training spots:', error);
        setError('Failed to load your training spots. The contract might not be properly deployed.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserTrainingSpots();
  }, [contract, account]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  if (!account) {
    return null;
  }

  return (
    <Card className="mb-4">
      <Card.Header as="h5">My Training Spots</Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading your training spots...
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : !contract ? (
          <Alert variant="warning">
            Contract not properly initialized. Please make sure you're connected to the Sepolia network and the contract is deployed.
          </Alert>
        ) : trainingSpots.length === 0 ? (
          <Alert variant="info">
            You don't own any training spots yet. Start bidding on auctions to win exclusive training sessions!
          </Alert>
        ) : (
          <ListGroup variant="flush">
            {trainingSpots.map((spot) => (
              <ListGroup.Item key={spot.tokenId} className="mb-3">
                <div className="d-flex flex-column flex-md-row">
                  <div 
                    className="mb-3 mb-md-0 me-md-3"
                    style={{
                      width: '100%',
                      maxWidth: '150px',
                      height: '120px',
                      backgroundImage: `url(${spot.imageUrl || 'https://via.placeholder.com/400x200?text=Training+Spot'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: '5px'
                    }}
                  />
                  
                  <div className="flex-grow-1">
                    <h5 className="mb-2">Training with {spot.coachName}</h5>
                    
                    <p className="mb-2">
                      <Badge bg="primary" className="me-2">Date</Badge>
                      {formatDate(spot.trainingDate)}
                    </p>
                    
                    <p className="mb-2">
                      <Badge bg="success" className="me-2">Location</Badge>
                      {spot.location}
                    </p>
                    
                    <p className="text-muted small">{spot.description}</p>
                    
                    <a
                      href={`https://sepolia.etherscan.io/token/${contract.address}?a=${spot.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary mt-2"
                    >
                      View on Etherscan
                    </a>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default MyTrainingSpots; 