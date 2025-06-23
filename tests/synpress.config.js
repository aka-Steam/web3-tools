module.exports = {
  testFiles: [
    './tests/synpress.e2e.js'
  ],
  metamask: {
    seed: process.env.METAMASK_SEED,
    password: process.env.METAMASK_PASSWORD,
    network: {
      name: 'Sepolia',
      chainId: 11155111,
      rpcUrl: process.env.RPC_URL
    }
  },
  baseUrl: 'http://localhost:3000',
  retries: 0
}; 