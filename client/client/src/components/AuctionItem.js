import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { placeBid, endAuction } from '../utils/contractHelpers';

const AuctionItem = ({ auction, refreshAuctions }) => {
  const { signer, account, isConnected } = useWeb3();
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    tokenId,
    name,
    imageUrl,
    coachName,
    trainingDate,
    description,
    location,
    highestBid,
    highestBidder,
    isActive
  } = auction;

  const isHighestBidder = account && highestBidder && highestBidder.toLowerCase() === account.toLowerCase();
  const currentBidEth = ethers.utils.formatEther(highestBid.toString());

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }
    
    if (parseFloat(bidAmount) <= parseFloat(currentBidEth)) {
      setError('Bid must be higher than current highest bid');
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await placeBid(signer, tokenId, bidAmount);
      if (success) {
        setBidAmount('');
        refreshAuctions();
      } else {
        setError('Transaction failed. Please try again.');
      }
    } catch (err) {
      setError('Error placing bid: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEndAuction = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await endAuction(signer, tokenId);
      if (success) {
        refreshAuctions();
      } else {
        setError('Failed to end auction');
      }
    } catch (err) {
      setError('Error ending auction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card h-100">
      {imageUrl && (
        <img
          src={imageUrl}
          className="card-img-top"
          alt={name}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      )}
      
      <div className="card-body">
        <h5 className="card-title">{name}</h5>
        <h6 className="card-subtitle mb-2 text-muted">Coach: {coachName}</h6>
        
        <p className="card-text">
          <small className="text-muted">
            <strong>Date:</strong> {trainingDate}
          </small>
          <br />
          <small className="text-muted">
            <strong>Location:</strong> {location}
          </small>
        </p>
        
        <p className="card-text">{description}</p>
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <strong>Current Bid:</strong> {currentBidEth} ETH
            {isHighestBidder && (
              <span className="badge bg-info ms-2">Your bid</span>
            )}
          </div>
          {isActive ? (
            <span className="badge bg-success">Active</span>
          ) : (
            <span className="badge bg-danger">Ended</span>
          )}
        </div>
        
        {isActive ? (
          <div>
            <form onSubmit={handleBidSubmit}>
              <div className="input-group mb-3">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Bid amount (ETH)"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  step="0.01"
                  min={parseFloat(currentBidEth) + 0.01}
                  disabled={loading || !isConnected}
                />
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={loading || !isConnected}
                >
                  {loading ? 'Bidding...' : 'Place Bid'}
                </button>
              </div>
            </form>
            
            {error && <div className="alert alert-danger">{error}</div>}
          </div>
        ) : (
          <div className="alert alert-info">
            Auction has ended. 
            {isHighestBidder ? (
              <strong> Congratulations! You won this auction!</strong>
            ) : (
              " You didn't win this auction."
            )}
          </div>
        )}
        
        {isActive && (
          <button
            className="btn btn-warning w-100 mt-2"
            onClick={handleEndAuction}
            disabled={loading || !isConnected}
          >
            {loading ? 'Processing...' : 'End Auction'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuctionItem; 