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
          console.warn('Please connect to the Sepolia test network');
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
        console.error('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error initializing web3', error);
      setContract(null);
      setIsOwner(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        await initializeEthereum();
      } else {
        alert('Please install MetaMask to use this application!');
      }
    } catch (error) {
      console.error('Error connecting to wallet', error);
    }
  };
  
  const disconnectWallet = () => {
    setAccount(null);
    setContract(null);
    setIsOwner(false);
  };
  
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        initializeEthereum();
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
    
    if (window.ethereum && window.ethereum.selectedAddress) {
      initializeEthereum();
    } else {
      setIsLoading(false);
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', initializeEthereum);
        window.ethereum.removeListener('chainChanged', () => window.location.reload());
      }
    };
  }, []);
  
  const value = {
    account,
    contract,
    provider,
    isOwner,
    isLoading,
    network,
    connectWallet,
    disconnectWallet
  };
  
  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}; 