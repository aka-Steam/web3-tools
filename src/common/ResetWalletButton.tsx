import React, { useContext } from 'react';
import { WalletContext } from './WalletContext';

const ResetWalletButton = () => {
  const { resetWallet } = useContext(WalletContext);
  
  return (
    <button 
      onClick={resetWallet}
      className="reset-btn"
    >
      Сбросить состояние кошелька
    </button>
  );
};

export default ResetWalletButton;