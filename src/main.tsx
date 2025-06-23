import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { WalletProvider } from './common/WalletContext';
import './index.scss';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
    <hr />
    <p style={{textAlign: 'start'}}>
    Для холодного подключения (cold start):<br />
    1. Нажмите "Сбросить состояние кошелька" (это эмулирует первый визит пользователя)<br />
    2. Нажмите "Холодное подключение" (измеряется полное время подключения)<br />
    3. Повторите шаги 1-2 для 3-5 измерений<br />
    <br />
    Для теплого подключения (warm start):<br />
    1. Убедитесь, что кошелек уже подключен (через холодное подключение или предыдущие операции)<br />
    2. Нажмите "Теплое подключение" (измеряется только время получения аккаунтов)<br />
    3. Повторите шаг 2 для 3-5 измерений без сброса  <br />
    </p>
  </React.StrictMode>
);