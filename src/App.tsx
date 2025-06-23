import { useState } from 'react';
import EthersDemo from './ethers/components/EthersDemo';
import ViemDemo from './viem/components/ViemDemo';
import ResetWalletButton from './common/ResetWalletButton';
import './App.scss';

function App() {
  const [activeTab, setActiveTab] = useState<'ethers' | 'viem'>('ethers');

  return (
    <div className="app">
      <div className="header">
        <h1>Web3 Библиотеки: Сравнение производительности</h1>
        <ResetWalletButton />
      </div>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'ethers' ? 'active' : ''}`}
          onClick={() => setActiveTab('ethers')}
        >
          Ethers.js
        </button>
        <button 
          className={`tab ${activeTab === 'viem' ? 'active' : ''}`}
          onClick={() => setActiveTab('viem')}
        >
          Viem
        </button>
      </div>

      <div className="demo-container">
        {activeTab === 'ethers' && <EthersDemo />}
        {activeTab === 'viem' && <ViemDemo />}
      </div>
    </div>
  );
}

export default App;