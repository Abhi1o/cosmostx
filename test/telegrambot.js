const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Proxy middleware configuration
const cosmosProxy = createProxyMiddleware({
  target: 'https://cosmos-rpc.quickapi.com', // or your preferred Cosmos RPC URL
  changeOrigin: true,
  pathRewrite: {
    '^/cosmos-api': '', // remove the /cosmos-api prefix when forwarding the request
  },
});

// Use the proxy middleware
app.use('/cosmos-api', cosmosProxy);

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});