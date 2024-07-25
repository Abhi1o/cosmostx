const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 8080;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());

app.use('/proxy', async (req, res) => {
  try {
    console.log(`Proxying request to: https://cosmos-rpc.quickapi.com${req.url}`);
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    const response = await axios({
      method: req.method,
      url: `https://cosmos-rpc.quickapi.com${req.url}`,
      headers: req.headers,
      data: req.body,
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error in proxy route:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).send(error.message);
    } }
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});