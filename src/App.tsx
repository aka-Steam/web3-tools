import { useState } from 'react';
import EthersDemo from './ethers/components/EthersDemo';
import ViemDemo from './viem/components/ViemDemo';
import ResetWalletButton from './common/ResetWalletButton';
import PerformanceReport from './common/PerformanceReport';
import MaturityMetrics from './common/MetricsDisplay';
import './App.scss';

function App() {
  const [activeTab, setActiveTab] = useState<'ethers' | 'viem' | 'report' | 'maturity'>('ethers');

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
        <button
          className={`tab ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          Отчет
        </button>
        <button
          className={`tab ${activeTab === 'maturity' ? 'active' : ''}`}
          onClick={() => setActiveTab('maturity')}
        >
          Зрелость
        </button>
      </div>

      <div className="demo-container">
        {activeTab === 'ethers' && <EthersDemo />}
        {activeTab === 'viem' && <ViemDemo />}
        {activeTab === 'report' && <PerformanceReport />}
        {activeTab === 'maturity' && <MaturityMetrics />}
      </div>
    </div>
  );
}

export default App;