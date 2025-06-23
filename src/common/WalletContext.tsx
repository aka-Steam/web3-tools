import React, { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface WalletState {
  accounts: string[];
  chainId: string;
}

interface WalletContextType {
  state: WalletState;
  lastResetTime: number;
  updateState: (newState: Partial<WalletState>) => void;
  resetWallet: () => void;
}

export const WalletContext = createContext<WalletContextType>({
  state: { accounts: [], chainId: '' },
  lastResetTime: 0,
  updateState: () => {},
  resetWallet: () => {}
});

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WalletState>({ accounts: [], chainId: '' });
  const [lastResetTime, setLastResetTime] = useState<number>(0);

  const updateState = (newState: Partial<WalletState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  const resetWallet = () => {
    // Эмуляция сброса разрешений
    if (window.ethereum) {
      window.ethereum._state = {};
      window.ethereum._metamask = {};
    }
    
    setState({ accounts: [], chainId: '' });
    setLastResetTime(Date.now());
  };

  // Слушаем события кошелька
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      updateState({ accounts });
    };

    const handleChainChanged = (chainId: string) => {
      updateState({ chainId });
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  return (
    <WalletContext.Provider value={{ 
      state, 
      lastResetTime,
      updateState, 
      resetWallet 
    }}>
      {children}
    </WalletContext.Provider>
  );
};