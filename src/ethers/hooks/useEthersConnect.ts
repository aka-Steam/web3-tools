import { useContext, useState } from 'react';
import { WalletContext } from '../../common/WalletContext';
import { BrowserProvider } from 'ethers';

export const useEthersConnect = () => {
//   const { state, updateState, resetWallet, lastResetTime } = useContext(WalletContext);
  const { state, updateState, resetWallet } = useContext(WalletContext);
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<{
    coldStart?: number;
    warmStart?: number;
  }>({});

  const connect = async (isColdStart: boolean) => {
    setIsLoading(true);
    
    try {
      if (isColdStart) {
        resetWallet();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const startTime = performance.now();
      
      if (!window.ethereum) throw new Error('Кошелек не обнаружен');
      
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      const duration = performance.now() - startTime;
      
      updateState({ accounts });
      setMetrics(prev => ({
        ...prev,
        [isColdStart ? 'coldStart' : 'warmStart']: duration
      }));
      
    } catch (error) {
      console.error('Ethers connect error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    connect,
    isLoading,
    metrics,
    accounts: state.accounts
  };
};