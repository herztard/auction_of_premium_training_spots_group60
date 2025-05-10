import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TrainingSpotNFT from '../contracts/TrainingSpotNFT.json';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [network, setNetwork] = useState(null);
  
  const initializeEthereum = async () => {
    setIsLoading(true);
    
    try {
      if (window.ethereum) {
        const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(ethProvider);
        
        const network = await ethProvider.getNetwork();
        setNetwork(network);
        
        const sepoliaChainId = '0xaa36a7';
        
        if (network.chainId.toString(16) !== sepoliaChainId.replace('0x', '')) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: sepoliaChainId }],
            });
            console.log("Successfully switched to Sepolia network");
          } catch (switchError) {
            console.error("Failed to switch network:", switchError);
            throw new Error('Please connect to the Sepolia test network');
          }
        }
        
        const signer = ethProvider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        
        const deployedNetwork = TrainingSpotNFT.networks[network.chainId];
        
        if (deployedNetwork && deployedNetwork.address && deployedNetwork.address !== "0x0000000000000000000000000000000000000000") {
          try {
            const trainingSpotContract = new ethers.Contract(
              deployedNetwork.address,
              TrainingSpotNFT.abi,
              signer
            );
            
            setContract(trainingSpotContract);
            
            try {
              const contractOwner = await trainingSpotContract.owner();
              setIsOwner(contractOwner.toLowerCase() === address.toLowerCase());
            } catch (ownerError) {
              console.error('Error checking contract owner:', ownerError);
              setIsOwner(false);
            }
          } catch (contractError) {
            console.error('Error initializing contract:', contractError);
            setContract(null);
          }
        } else {
          console.error('Contract not deployed on the current network');
          setContract(null);
        }
      } else {
        throw new Error('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error initializing web3', error);
      setContract(null);
      setIsOwner(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        console.log("Attempting to connect wallet...");
        
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log("Account access granted");
        } catch (requestError) {
          console.error("Account request error:", requestError);
          throw new Error('Failed to connect: ' + requestError.message);
        }
        
        await initializeEthereum();
      } else {
        throw new Error('Please install MetaMask to use this application!');
      }
    } catch (error) {
      console.error('Error connecting to wallet', error);
      throw error;
    }
  };
  
  const disconnectWallet = async () => {
    try {
      if (window.ethereum) {
        try {
          await window.ethereum.request({
            method: "wallet_revokePermissions",
            params: [{ eth_accounts: {} }]
          });
          console.log("Successfully revoked permissions");
        } catch (revokeError) {
          console.log("Revoke permissions not supported, using alternative method", revokeError);
          // If revoke permissions is not supported, we'll just clear our state
        }
      }
      
      // Clear all state
      setAccount(null);
      setContract(null);
      setIsOwner(false);
      setProvider(null);
      
      // Reload the page to ensure clean state
      window.location.reload();
    } catch (error) {
      console.error('Error during disconnect:', error);
      // Even if there's an error, we should still clear the state
      setAccount(null);
      setContract(null);
      setIsOwner(false);
      setProvider(null);
    }
  };
  
  useEffect(() => {
    if (window.ethereum) {
      // Handle account changes
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          setAccount(null);
          setContract(null);
          setIsOwner(false);
          setProvider(null);
        } else {
          // Account changed, reinitialize
          initializeEthereum();
        }
      };
      
      // Handle chain changes
      const handleChainChanged = () => {
        window.location.reload();
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      // Check if already connected
      if (window.ethereum.selectedAddress) {
        initializeEthereum();
      } else {
        setIsLoading(false);
      }
      
      // Cleanup listeners
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    } else {
      setIsLoading(false);
    }
  }, []);
  
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const value = {
    account,
    contract,
    provider,
    isOwner,
    isLoading,
    network,
    connectWallet,
    disconnectWallet,
    formatAddress
  };
  
  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}; 