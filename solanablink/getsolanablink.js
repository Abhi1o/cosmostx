const express = require('express');
const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const { ActionPostResponse, ACTIONS_CORS_HEADERS, createPostResponse, ActionGetResponse } = require('@solana/actions');
const cors = require('cors');

// Enable CORS for all routes

app.use(cors());
const app = express();
app.use(express.json());

const SOLANA_NETWORK = 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_NETWORK);

// GET endpoint for chat action
app.get('/api/actions/chat', (req, res) => {
    const payload = {
        title: "Solana Chat Action",
        description: "Send a message to the Solana blockchain",
        icon: "https://solana.com/src/img/branding/solanaLogoMark.svg",
        links: {
            actions: [
                {
                    label: "Send Message",
                    href: "/api/actions/chat?message={message}",
                    parameters: [
                        {
                            name: "message",
                            label: "Enter your message",
                            required: true
                        }
                    ]
                }
            ]
        }
    };

    res.header(ACTIONS_CORS_HEADERS).json(payload);
});

// POST endpoint for chat action
app.post('/api/actions/chat', async (req, res) => {
    try {
        const { message } = req.query;
        const { account } = req.body;

        if (!message) {
            throw new Error("Message is required");
        }

        const senderPubkey = new PublicKey(account);

        // Create a transaction to send 0 SOL with a memo (our message)
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: senderPubkey,
                toPubkey: senderPubkey,
                lamports: 0
            })
        );

        // Add the message as a memo to the transaction
        transaction.add({
            keys: [],
            programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
            data: Buffer.from(message)
        });

        transaction.feePayer = senderPubkey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const payload = await createPostResponse({
            fields: {
                transaction,
                message: `Send message: ${message}`
            }
        });

        res.header(ACTIONS_CORS_HEADERS).json(payload);
    } catch (error) {
        console.error(error);
        res.status(400).header(ACTIONS_CORS_HEADERS).send(error.message);
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));