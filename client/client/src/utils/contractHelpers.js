import { ethers } from 'ethers';

const ABI = [
  "function getAllAuctions() view returns (tuple(uint256 tokenId, string name, string imageUrl, string coachName, string trainingDate, string description, string location, uint256 highestBid, address highestBidder, bool isActive)[])",
  "function placeBid(uint256 tokenId) payable",
  "function endAuction(uint256 tokenId)",
  "function getAuctionDetails(uint256 tokenId) view returns (tuple(uint256 tokenId, string name, string imageUrl, string coachName, string trainingDate, string description, string location, uint256 highestBid, address highestBidder, bool isActive))"
];

const CONTRACT_ADDRESS = "0xbE07d2FfB97A7d3025f5ae34424f0b6E5B2d56C7";

export const getContract = (signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
};

export const getAllAuctions = async (provider) => {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const auctions = await contract.getAllAuctions();
    return auctions;
  } catch (error) {
    console.error("Error fetching auctions:", error);
    return [];
  }
};

export const placeBid = async (signer, tokenId, bidAmount) => {
  try {
    const contract = getContract(signer);
    const tx = await contract.placeBid(tokenId, {
      value: ethers.utils.parseEther(bidAmount)
    });
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Error placing bid:", error);
    return false;
  }
};

export const endAuction = async (signer, tokenId) => {
  try {
    const contract = getContract(signer);
    const tx = await contract.endAuction(tokenId);
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Error ending auction:", error);
    return false;
  }
};

export const getAuctionDetails = async (provider, tokenId) => {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const auctionDetails = await contract.getAuctionDetails(tokenId);
    return auctionDetails;
  } catch (error) {
    console.error("Error fetching auction details:", error);
    return null;
  }
}; 