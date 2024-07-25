const solanaWeb3 = require('@solana/web3.js');

app.post('/send-sol', async (req, res) => {
  const { account, recipient, amount } = req.body;
  const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'), 'confirmed');
  const transaction = new solanaWeb3.Transaction().add(
    solanaWeb3.SystemProgram.transfer({
      fromPubkey: new solanaWeb3.PublicKey(account),
      toPubkey: new solanaWeb3.PublicKey(recipient),
      lamports: solanaWeb3.LAMPORTS_PER_SOL * amount,
    })
  );

  res.json({
    transaction: transaction.serialize().toString('base64'),
    message: 'Send SOL tokens to recipient',
  });
});