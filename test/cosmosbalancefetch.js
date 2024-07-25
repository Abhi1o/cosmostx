const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');

app.use(cors());
app.get('/api/cosmos/balance', async (req, res) => {
  const { address } = req.query;
  
  try {
    const response = await axios.post('https://cosmos-rpc.quickapi.com', {
      jsonrpc: '2.0',
      id: 1,
      method: 'cosmos_getAllBalances',
      params: [address]
    });
    
    const balances = response.data.result;
    const atomBalance = balances.find(b => b.denom === 'uatom');
    const balance = atomBalance ? atomBalance.amount : '0';
    
    res.json({ balance });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

app.listen(8899, () => console.log('Backend server running on port 8899'));