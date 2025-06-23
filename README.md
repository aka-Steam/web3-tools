# Web3-tools

Stack: React + TypeScript + Vite

Start app:

```bash
npm run dev
```

Start tests:

```bash
node tests/performance.test.js
```

Тестирование с реальными кошельком

```bash
npm run test:e2e
```

Важно
- Не используйте seed-фразу от основного кошелька! Только тестовые аккаунты.
- Тесты будут запускать реальный браузер с MetaMask, потребуется немного времени на установку расширения и подтверждение действий.