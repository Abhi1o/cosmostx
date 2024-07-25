const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

app.use(cors());

app.use('/', createProxyMiddleware({
  target: 'https://cosmos-rpc.comdex.one:443/cosmos',
  // target: 'https://cosmos-rpc.quickapi.com:443',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('Access-Control-Allow-Origin', '*');
  },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  },
}));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  
  console.log(`CORS Proxy Server running on port ${PORT}`);
});