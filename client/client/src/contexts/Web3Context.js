import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);

  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions: {},
      });
      
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const accounts = await provider.listAccounts();
      const network = await provider.getNetwork();
      
      setAccount(accounts[0]);
      setProvider(provider);
      setSigner(signer);
      setIsConnected(true);
      setChainId(network.chainId);

      // Handle account changes
      connection.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          disconnectWallet();
        }
      });

      // Handle chain changes
      connection.on("chainChanged", async (chainId) => {
        window.location.reload();
      });
      
      return true;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      return false;
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    setChainId(null);
    
    localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER');
  };

  // Auto-connect if cached provider exists
  useEffect(() => {
    if (localStorage.getItem('WEB3_CONNECT_CACHED_PROVIDER')) {
      connectWallet();
    }
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        isConnected,
        chainId,
        connectWallet,
        disconnectWallet
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context); 