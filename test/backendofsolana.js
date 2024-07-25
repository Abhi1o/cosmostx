// const express = require('express');
// const { Connection, PublicKey, Keypair, clusterApiUrl, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
// const bodyParser = require('body-parser');
// const cors = require('cors');


// const app = express();
// const port = 8080;
// app.use(cors());

// app.use(bodyParser.json());

// app.post('/send-token', async (req, res) => {
//     const { senderSecretKey, receiverAddress, amount } = req.body;

//     const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

//     const senderKeypair = Keypair.fromSecretKey(new Uint8Array(senderSecretKey));
//     const receiverPublicKey = new PublicKey(receiverAddress);

//     const transaction = new Transaction().add(
//         SystemProgram.transfer({
//             fromPubkey: senderKeypair.publicKey,
//             toPubkey: receiverPublicKey,
//             lamports: amount * LAMPORTS_PER_SOL,
//         })
//     );

//     try {
//         const signature = await connection.sendTransaction(transaction, [senderKeypair]);
//         await connection.confirmTransaction(signature, 'confirmed');
//         res.status(200).json({ signature });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Connection, Keypair, Transaction, LAMPORTS_PER_SOL, SystemProgram, sendAndConfirmTransaction, PublicKey,clusterApiUrl} = require('@solana/web3.js');
const bip39 = require('bip39');

const app = express();

app.use(cors());
app.use(express.json());

const rpcEndpoints = {
     solana: clusterApiUrl('devnet'),
};

// Helper functions for Solana transactions
async function executeSolanaTransaction(transactionType, mnemonic, params) {
    const connection = new Connection(rpcEndpoints.solana, 'confirmed');
    const keypair = getSolanaKeypairFromMnemonic(mnemonic);

    let transaction = new Transaction();
    let result;

    switch (transactionType) {
        case 'send':
            const sendAmount = parseInt(params.amount, 10) * LAMPORTS_PER_SOL;
            transaction.add(SystemProgram.transfer({
                fromPubkey: keypair.publicKey,
                toPubkey: new PublicKey(params.recipient),
                lamports: sendAmount,
            }));
            break;
        // Add other transaction types as needed
        default:
            throw new Error('Unsupported transaction type');
    }

    result = await sendAndConfirmTransaction(connection, transaction, [keypair]);
    return result;
}

function getSolanaKeypairFromMnemonic(mnemonic) {
    const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
    return Keypair.fromSeed(seed);
}

// API endpoint for transactions
app.post('/api/transaction', async (req, res) => {
    const { chainName, transactionType, mnemonic, params } = req.body;

    try {
        let result;
        switch (chainName) {
            case 'solana':
                result = await executeSolanaTransaction(transactionType, mnemonic, params);
                break;
            default:
                return res.status(400).send('Unsupported chain');
        }
        res.send({ success: true, hash: result });
    } catch (error) {
        console.error('Error executing transaction:', error);
        res.status(500).send('Error executing transaction');
    }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});