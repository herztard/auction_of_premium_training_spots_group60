import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { getAllAuctions } from '../utils/contractHelpers';
import AuctionItem from './AuctionItem';

const AuctionList = () => {
  const { provider, isConnected } = useWeb3();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAuctions = async () => {
    if (!provider) {
      setAuctions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const fetchedAuctions = await getAllAuctions(provider);
      setAuctions(fetchedAuctions);
      setError('');
    } catch (err) {
      console.error('Error fetching auctions:', err);
      setError('Failed to load auctions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch auctions on initial load and whenever provider changes
  useEffect(() => {
    if (provider) {
      fetchAuctions();
    }
  }, [provider]);

  // Sample data for when we don't have a provider yet
  const sampleAuctions = [
    {
      tokenId: 1,
      name: "Private Boxing Session",
      imageUrl: "https://images.unsplash.com/photo-1549824506-b7045acb4489",
      coachName: "Mike Tyson",
      trainingDate: "2023-12-15, 10:00 AM",
      description: "One-on-one boxing training session with the legend himself.",
      location: "New York City",
      highestBid: { toString: () => "500000000000000000" },
      highestBidder: "0x0000000000000000000000000000000000000000",
      isActive: true
    },
    {
      tokenId: 2,
      name: "Swimming Masterclass",
      imageUrl: "https://images.unsplash.com/photo-1560090995-dff1c50eed56",
      coachName: "Michael Phelps",
      trainingDate: "2023-12-20, 2:00 PM",
      description: "Learn swimming techniques from the Olympic champion.",
      location: "Los Angeles",
      highestBid: { toString: () => "750000000000000000" },
      highestBidder: "0x0000000000000000000000000000000000000000",
      isActive: true
    },
    {
      tokenId: 3,
      name: "Tennis Pro Training",
      imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0",
      coachName: "Serena Williams",
      trainingDate: "2023-12-18, 11:00 AM",
      description: "Exclusive tennis training session with the tennis legend.",
      location: "Miami",
      highestBid: { toString: () => "600000000000000000" },
      highestBidder: "0x0000000000000000000000000000000000000000",
      isActive: true
    }
  ];

  const displayAuctions = auctions.length > 0 ? auctions : (isConnected ? [] : sampleAuctions);

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Available Training Sessions</h2>
      
      {!isConnected && (
        <div className="alert alert-warning mb-4">
          <strong>Note:</strong> Connect your wallet to see real auctions and place bids. 
          Showing sample data for preview.
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading auctions...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : displayAuctions.length === 0 ? (
        <div className="alert alert-info">No auctions available at the moment.</div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {displayAuctions.map((auction) => (
            <div className="col" key={auction.tokenId.toString()}>
              <AuctionItem
                auction={auction}
                refreshAuctions={fetchAuctions}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuctionList; 