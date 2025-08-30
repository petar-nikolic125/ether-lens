import { useState, useEffect } from 'react';
import { walletService, type WalletState } from '@/lib/wallet';

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>(walletService.getState());
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const unsubscribe = walletService.subscribe(setWalletState);
    return unsubscribe;
  }, []);

  const connect = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    try {
      await walletService.connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await walletService.disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  };

  const switchToEthereum = async () => {
    try {
      await walletService.switchToEthereum();
    } catch (error) {
      console.error('Failed to switch network:', error);
      throw error;
    }
  };

  return {
    ...walletState,
    isConnecting,
    connect,
    disconnect,
    switchToEthereum,
    formatAddress: walletService.formatAddress,
  };
};