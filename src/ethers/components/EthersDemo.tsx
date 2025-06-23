import React from 'react';
import { useEthersConnect } from '../hooks/useEthersConnect';

const EthersDemo: React.FC = () => {
  const { connect, isLoading, metrics, accounts, signTransaction } = useEthersConnect();
  
  return (
    <div className="demo">
      <h2>Ethers.js Реализация</h2>
      
      <div className="controls">
        <button 
          onClick={() => connect(true)} 
          disabled={isLoading}
          className="btn cold"
          data-testid="cold-connect-btn"
        >
          {isLoading ? 'Подключение...' : 'Холодное подключение'}
        </button>
        
        <button 
          onClick={() => connect(false)} 
          disabled={isLoading}
          className="btn warm"
          data-testid="warm-connect-btn"
        >
          {isLoading ? 'Подключение...' : 'Теплое подключение'}
        </button>
        <button
          onClick={signTransaction}
          disabled={isLoading || !accounts.length}
          className="btn sign"
          data-testid="sign-btn"
        >
          {isLoading ? 'Подпись...' : 'Подписать транзакцию'}
        </button>
      </div>
      
      {accounts.length > 0 && (
        <div className="account-info">
          <p>Подключенный аккаунт: {accounts[0]}</p>
        </div>
      )}
      
      <div className="metrics">
        {metrics.coldStart && (
          <div className="metric">
            <h4>Холодное подключение:</h4>
            <p>{metrics.coldStart.toFixed(2)} мс</p>
          </div>
        )}
        
        {metrics.warmStart && (
          <div className="metric">
            <h4>Теплое подключение:</h4>
            <p>{metrics.warmStart.toFixed(2)} мс</p>
          </div>
        )}
        {metrics.sign && (
          <div className="metric">
            <h4>Подпись транзакции:</h4>
            <p>{metrics.sign.toFixed(2)} мс</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EthersDemo;