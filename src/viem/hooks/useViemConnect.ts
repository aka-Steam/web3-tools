import { useContext, useState } from 'react';
import { WalletContext } from '../../common/WalletContext';
import { createWalletClient, custom } from 'viem';
import { sepolia } from 'viem/chains';

export const useViemConnect = () => {
//   const { state, updateState, resetWallet, lastResetTime } = useContext(WalletContext);
  const { state, updateState, resetWallet } = useContext(WalletContext);
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<{
    coldStart?: number;
    warmStart?: number;
    sign?: number;
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
      
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum)
      });
      
      const [address] = await walletClient.getAddresses();
      
      const duration = performance.now() - startTime;
      
      updateState({ accounts: [address] });
      setMetrics(prev => ({
        ...prev,
        [isColdStart ? 'coldStart' : 'warmStart']: duration
      }));
      
    } catch (error) {
      console.error('Viem connect error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signTransaction = async () => {
    setIsLoading(true);
    try {
      const startTime = performance.now();
      if (!window.ethereum) throw new Error('Кошелек не обнаружен');
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum)
      });
      const [address] = await walletClient.getAddresses();
      // Подписываем простое сообщение (можно заменить на signTransaction, если нужно)
      const signature = await walletClient.signMessage({ account: address, message: 'Performance test' });
      const duration = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, sign: duration }));
      return { signature, duration };
    } catch (error) {
      console.error('Viem sign error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    connect,
    isLoading,
    metrics,
    accounts: state.accounts,
    signTransaction
  };
};