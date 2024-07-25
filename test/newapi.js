const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = 5000;


// Define the URL
const url = "https://88db-18-213-200-192.ngrok-free.app/predict";

// Define the payload
const payload = {
  inputs: "<human>: Send 2 ATOM to cosmos1t2hn9j9x0t7y0ngylm5uvuw0dhv9ypy5hcyfws on Cosmos.<assistant>:"
};

// Define the headers
const headers = {
  "Content-Type": "application/json"
};

// Route to trigger the fetch request
app.get('/send-atom', async (req, res) => {
  try {
    const response = await fetch(url, {
      method: "POST", // Corrected to POST
      headers: headers,
      body: JSON.stringify(payload)
    });

    // Print the status code
    console.log("Status Code:", response.status);

    // Get the response text
    const data = await response.text();

    // Print the response text
    console.log(data);

    // Send the response text back to the client
    res.send(data);
  } catch (error) {
    // Print any errors
    console.error("Error:", error);

    // Send the error message back to the client
    res.status(500).send("An error occurred");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
