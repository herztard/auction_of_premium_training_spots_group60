// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

library Base64 {
    bytes internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";

        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        bytes memory result = new bytes(encodedLen);

        for (uint256 i = 0; i < data.length; i += 3) {
            uint256 a = uint256(uint8(data[i]));
            uint256 b = i + 1 < data.length ? uint256(uint8(data[i + 1])) : 0;
            uint256 c = i + 2 < data.length ? uint256(uint8(data[i + 2])) : 0;

            uint256 encoded = (a << 16) | (b << 8) | c;

            result[i / 3 * 4] = bytes1(uint8(TABLE[encoded >> 18]));
            result[i / 3 * 4 + 1] = bytes1(uint8(TABLE[(encoded >> 12) & 0x3F]));
            result[i / 3 * 4 + 2] = i + 1 < data.length ? bytes1(uint8(TABLE[(encoded >> 6) & 0x3F])) : bytes1("=");
            result[i / 3 * 4 + 3] = i + 2 < data.length ? bytes1(uint8(TABLE[encoded & 0x3F])) : bytes1("=");
        }

        return string(result);
    }
}

contract TrainingSpotNFT is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;
    
    uint256 private _tokenIdCounter;

    struct Auction {
        uint256 tokenId;
        address highestBidder;
        uint256 highestBid;
        uint256 auctionEndTime;
        bool ended;
    }
    
    struct TrainingSpot {
        string coachName;
        uint256 trainingDate;
        string description;
        string location;
        string imageUrl;
    }

    mapping(uint256 => Auction) public tokenIdToAuction;
    
    mapping(uint256 => TrainingSpot) private _trainingSpots;

    event AuctionCreated(uint256 tokenId, uint256 auctionEndTime);
    event BidPlaced(uint256 tokenId, address bidder, uint256 amount);
    event AuctionEnded(uint256 tokenId, address winner, uint256 amount);
    event MetadataSet(uint256 tokenId, string coachName, uint256 trainingDate, string location);

    constructor() ERC721("TrainingSpotNFT", "TRAIN") Ownable(msg.sender) {}

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return generateTokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    function setTrainingSpotData(
        uint256 tokenId,
        string memory coachName,
        uint256 trainingDate,
        string memory description,
        string memory location,
        string memory imageUrl
    ) internal {
        _trainingSpots[tokenId] = TrainingSpot({
            coachName: coachName,
            trainingDate: trainingDate,
            description: description,
            location: location,
            imageUrl: imageUrl
        });
        
        emit MetadataSet(tokenId, coachName, trainingDate, location);
    }
    
    function getTrainingSpotData(uint256 tokenId) public view returns (
        string memory coachName,
        uint256 trainingDate,
        string memory description,
        string memory location,
        string memory imageUrl
    ) {
        TrainingSpot memory spot = _trainingSpots[tokenId];
        
        return (
            spot.coachName,
            spot.trainingDate,
            spot.description,
            spot.location,
            spot.imageUrl
        );
    }
    
    function generateTokenURI(uint256 tokenId) internal view returns (string memory) {
        TrainingSpot memory spot = _trainingSpots[tokenId];
        
        bytes memory json = abi.encodePacked(
            '{',
            '"name": "Training Session with ', spot.coachName, '",',
            '"description": "', spot.description, '",',
            '"attributes": [',
            '{"trait_type": "Coach", "value": "', spot.coachName, '"},',
            '{"trait_type": "Date", "value": "', Strings.toString(spot.trainingDate), '"},',
            '{"trait_type": "Location", "value": "', spot.location, '"}',
            '],',
            '"image": "', spot.imageUrl, '"',
            '}'
        );
        
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(json)
            )
        );
    }

    function createTrainingSpot(
        string memory coachName,
        uint256 trainingDate,
        string memory description,
        string memory location,
        string memory imageUrl
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _mint(address(this), tokenId);
        
        setTrainingSpotData(
            tokenId,
            coachName,
            trainingDate,
            description,
            location,
            imageUrl
        );
        
        uint256 auctionEnd = block.timestamp + 24 hours;
        
        tokenIdToAuction[tokenId] = Auction({
            tokenId: tokenId,
            highestBidder: address(0),
            highestBid: 0,
            auctionEndTime: auctionEnd,
            ended: false
        });
        
        emit AuctionCreated(tokenId, auctionEnd);
        
        return tokenId;
    }

    function placeBid(uint256 tokenId) public payable {
        Auction storage auction = tokenIdToAuction[tokenId];
        
        require(auction.tokenId == tokenId, "Training spot does not exist");
        require(!auction.ended, "Auction has already ended");
        require(block.timestamp < auction.auctionEndTime, "Auction has expired");
        require(msg.value > auction.highestBid, "Bid must be higher than current highest bid");
        
        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }
        
        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;
        auction.auctionEndTime = block.timestamp + 24 hours;
        
        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    // End an auction manually (can be called by owner)
    function endAuction(uint256 tokenId) public {
        Auction storage auction = tokenIdToAuction[tokenId];
        
        require(auction.tokenId == tokenId, "Training spot does not exist");
        require(!auction.ended, "Auction has already ended");
        require(msg.sender == owner() || block.timestamp >= auction.auctionEndTime, 
                "Only owner can end auction before time expires");
        
        auction.ended = true;
        
        if (auction.highestBidder != address(0)) {
            _safeTransfer(address(this), auction.highestBidder, tokenId, "");
            payable(owner()).transfer(auction.highestBid);
        }
        
        emit AuctionEnded(tokenId, auction.highestBidder, auction.highestBid);
    }
    
    function checkAuctionStatus(uint256 tokenId) public view returns (bool) {
        Auction storage auction = tokenIdToAuction[tokenId];
        
        if (!auction.ended && block.timestamp >= auction.auctionEndTime) {
            return true;
        }
        
        return false;
    }
    
    function getAuctionDetails(uint256 tokenId) public view returns (
        address highestBidder,
        uint256 highestBid,
        uint256 auctionEndTime,
        bool ended
    ) {
        Auction storage auction = tokenIdToAuction[tokenId];
        
        return (
            auction.highestBidder,
            auction.highestBid,
            auction.auctionEndTime,
            auction.ended
        );
    }
    
    function getActiveAuctions() public view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (!tokenIdToAuction[i].ended) {
                activeCount++;
            }
        }
        
        uint256[] memory activeAuctions = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (!tokenIdToAuction[i].ended) {
                activeAuctions[index] = i;
                index++;
            }
        }
        
        return activeAuctions;
    }
    
    function getTokensOfOwner(address owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (_ownerOf(i) == owner) {
                tokenIds[tokenCount - 1] = i;
                tokenCount--;
                if (tokenCount == 0) {
                    break;
                }
            }
        }
        
        return tokenIds;
    }
}

