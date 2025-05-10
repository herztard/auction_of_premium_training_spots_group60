import React, { useState, useEffect } from 'react';
import { Card, Button, Form, InputGroup, Alert, Badge } from 'react-bootstrap';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';

const AuctionCard = ({ tokenId }) => {
  const { contract, account, isOwner } = useWeb3();
  const [trainingSpot, setTrainingSpot] = useState(null);
  const [auction, setAuction] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (contract && tokenId !== undefined) {
          const spotData = await contract.getTrainingSpotData(tokenId);
          setTrainingSpot({
            coachName: spotData[0],
            trainingDate: spotData[1],
            description: spotData[2],
            location: spotData[3],
            imageUrl: spotData[4],
          });

          const auctionData = await contract.getAuctionDetails(tokenId);
          setAuction({
            highestBidder: auctionData[0],
            highestBid: auctionData[1],
            auctionEndTime: auctionData[2],
            ended: auctionData[3],
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load auction data');
      }
    };

    fetchData();
  }, [contract, tokenId]);

  useEffect(() => {
    if (!auction) return;

    const updateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const endTime = Number(auction.auctionEndTime);
      
      if (now >= endTime || auction.ended) {
        setTimeLeft('Auction ended');
        return;
      }
      
      const secondsLeft = endTime - now;
      const hours = Math.floor(secondsLeft / 3600);
      const minutes = Math.floor((secondsLeft % 3600) / 60);
      const seconds = secondsLeft % 60;
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimeLeft();
    const intervalId = setInterval(updateTimeLeft, 1000);
    
    return () => clearInterval(intervalId);
  }, [auction]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const handleBid = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (!bidAmount || parseFloat(bidAmount) <= 0) {
        setError('Please enter a valid bid amount');
        return;
      }

      const ethAmount = ethers.utils.parseEther(bidAmount);
      
      if (auction && ethAmount.lte(auction.highestBid)) {
        setError('Bid must be higher than current highest bid');
        return;
      }

      const tx = await contract.placeBid(tokenId, { value: ethAmount });
      await tx.wait();
      
      const auctionData = await contract.getAuctionDetails(tokenId);
      setAuction({
        highestBidder: auctionData[0],
        highestBid: auctionData[1],
        auctionEndTime: auctionData[2],
        ended: auctionData[3],
      });
      
      setBidAmount('');
    } catch (error) {
      console.error('Error placing bid:', error);
      setError(error.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  const handleEndAuction = async () => {
    setLoading(true);
    setError('');
    
    try {
      const tx = await contract.endAuction(tokenId);
      await tx.wait();
      
      const auctionData = await contract.getAuctionDetails(tokenId);
      setAuction({
        highestBidder: auctionData[0],
        highestBid: auctionData[1],
        auctionEndTime: auctionData[2],
        ended: auctionData[3],
      });
    } catch (error) {
      console.error('Error ending auction:', error);
      setError(error.message || 'Failed to end auction');
    } finally {
      setLoading(false);
    }
  };

  if (!trainingSpot || !auction) {
    return (
      <Card className="h-100 mb-4">
        <div className="placeholder-glow">
          <Card.Img variant="top" height="200" className="bg-secondary" />
          <Card.Body>
            <h5 className="placeholder col-6"></h5>
            <p className="placeholder col-7"></p>
            <p className="placeholder col-4"></p>
          </Card.Body>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-100 mb-4">
      <Card.Img 
        variant="top" 
        src={trainingSpot.imageUrl || 'https://via.placeholder.com/400x200?text=Training+Spot'} 
        style={{ height: '200px', objectFit: 'cover' }}
      />
      
      <Card.Body>
        <Card.Title>Training with {trainingSpot.coachName}</Card.Title>
        
        <Card.Text className="text-muted">
          <strong>When:</strong> {formatDate(trainingSpot.trainingDate)}<br />
          <strong>Where:</strong> {trainingSpot.location}<br />
          {trainingSpot.description}
        </Card.Text>
        
        <hr />
        
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold">Current bid:</span>
          <span className="fs-5">
            {auction.highestBid && ethers.utils.formatEther(auction.highestBid)} ETH
          </span>
        </div>
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="fw-bold">Time left:</span>
          <Badge bg={auction.ended ? "danger" : "success"}>
            {timeLeft}
          </Badge>
        </div>
        
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
        
        {!auction.ended && account && (
          <Form onSubmit={handleBid} className="mb-3">
            <InputGroup>
              <Form.Control
                type="number"
                step="0.01"
                placeholder="Bid amount (ETH)"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                disabled={loading}
              />
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Place Bid'}
              </Button>
            </InputGroup>
          </Form>
        )}
        
        {isOwner && !auction.ended && (
          <Button
            variant="warning"
            className="w-100"
            onClick={handleEndAuction}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'End Auction'}
          </Button>
        )}
        
        {auction.ended && auction.highestBidder !== ethers.constants.AddressZero && (
          <Alert variant="success">
            <Alert.Heading>Auction ended</Alert.Heading>
            <p>
              {auction.highestBidder.toLowerCase() === account?.toLowerCase()
                ? 'You won this auction!'
                : `Winner: ${auction.highestBidder.substring(0, 6)}...${auction.highestBidder.substring(auction.highestBidder.length - 4)}`}
            </p>
            <p className="mb-0">
              Winning bid: {auction.highestBid && ethers.utils.formatEther(auction.highestBid)} ETH
            </p>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default AuctionCard; 