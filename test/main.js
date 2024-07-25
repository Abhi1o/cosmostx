const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const bodyParser = require('body-parser');
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { assertIsBroadcastTxSuccess, SigningStargateClient } = require('@cosmjs/stargate');
const { Connection, Keypair, Transaction, LAMPORTS_PER_SOL, SystemProgram, sendAndConfirmTransaction } = require('@solana/web3.js');
const { ethers } = require('ethers');
const bip39 = require('bip39');

const app = express();

app.use(cors());
app.use(express.json());
// app.use(express.json());

const rpcEndpoints = {
    cosmoshub: { rpcEndpoint: 'https://cosmos-rpc.quickapi.com:443', prefix: 'cosmos', denom: 'uatom' },
    osmosis: { rpcEndpoint: 'https://rpc-osmosis.blockapsis.com', prefix: 'osmo', denom: 'uosmo' },
    akash: { rpcEndpoint: 'https://rpc.akash.forbole.com', prefix: 'akash', denom: 'uakt' },
    solana: 'https://api.mainnet-beta.solana.com',
    ethereum: 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID',
};

// Helper functions for transactions
async function executeCosmosTransaction(chainConfig, transactionType, mnemonic, params) {
    

    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: chainConfig.prefix });
    const [firstAccount] = await wallet.getAccounts();

    
    const client = await SigningStargateClient.connectWithSigner(chainConfig.rpcEndpoint, wallet);
    
    const fee = {
        amount: [{ denom: chainConfig.denom, amount: '10000' }],
        gas: '200000',
    };

    let result;

    switch (transactionType) {

        case 'send':
            const sendAmount = { denom: chainConfig.denom, amount: (parseFloat(params.amount) * 1000000).toString() };
            result = await client.sendTokens(firstAccount.address, params.recipient, [sendAmount], fee, 'Sending tokens');
           
            break;
        // Add other transaction types as needed
        case 'ibcTransfer':
            const transferAmount = { denom: chainConfig.denom, amount:  (parseFloat(params.amount) * 1000000).toString() };
            const channel = { sourcePort: 'transfer', sourceChannel: 'channel-0' };
            const timeoutHeight = { revisionNumber: 1, revisionHeight: 12345678 };
            result = await client.sendIbcTokens(firstAccount.address, params.recipient, transferAmount, channel, timeoutHeight, fee, 'IBC transfer');
            break;
        case 'delegate':
            const delegateAmount = { denom: chainConfig.denom, amount:  (parseFloat(params.amount) * 1000000).toString() };
            result = await client.delegateTokens(firstAccount.address, params.validatorAddress, delegateAmount, fee, 'Delegating tokens');
            break;
        case 'undelegate':
            const undelegateAmount = { denom: chainConfig.denom, amount:  (parseFloat(params.amount) * 1000000).toString() };
            result = await client.undelegateTokens(firstAccount.address, params.validatorAddress, undelegateAmount, fee, 'Undelegating tokens');
            break;
        case 'redelegate':
            const redelegateAmount = { denom: chainConfig.denom, amount:  (parseFloat(params.amount) * 1000000).toString() };
            result = await client.redelegateTokens(firstAccount.address, params.srcValidatorAddress, params.dstValidatorAddress, redelegateAmount, fee, 'Redelegating tokens');
            break;
        case 'submitProposal':
            const proposalMsg = {
                typeUrl: '/cosmos.gov.v1beta1.MsgSubmitProposal',
                value: {
                    content: {
                        typeUrl: '/cosmos.gov.v1beta1.TextProposal',
                        value: { title: params.title, description: params.description },
                    },
                    initialDeposit: [{ denom: chainConfig.denom, amount:  (parseFloat(params.deposit) * 1000000).toString() }],
                    proposer: firstAccount.address,
                },
            };
            result = await client.signAndBroadcast(firstAccount.address, [proposalMsg], fee, 'Submitting proposal');
            break;
        case 'vote':
            const voteMsg = {
                typeUrl: '/cosmos.gov.v1beta1.MsgVote',
                value: { proposalId: params.proposalId, voter: firstAccount.address, option: params.option },
            };
            result = await client.signAndBroadcast(firstAccount.address, [voteMsg], fee, 'Voting on proposal');
            break;
        default:
            throw new Error('Unsupported transaction type');
        
    }

    console.log(result.transactionHash);
    console.log("this the the transaction result",result);
    // assertIsBroadcastTxSuccess(result);
    return result.transactionHash;
}

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
                toPubkey: params.recipient,
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

async function executeEthereumTransaction(transactionType, mnemonic, params) {
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoints.ethereum);
    const wallet = getEthereumWalletFromMnemonic(mnemonic).connect(provider);

    let result;

    switch (transactionType) {
        case 'send':
            const sendAmount = ethers.utils.parseEther(params.amount);
            const tx = {
                to: params.recipient,
                value: sendAmount,
                gasLimit: 21000,
                gasPrice: await provider.getGasPrice(),
            };
            result = await wallet.sendTransaction(tx);
            break;
        // Add other transaction types as needed
        default:
            throw new Error('Unsupported transaction type');
    }

    return result.hash;
}

function getSolanaKeypairFromMnemonic(mnemonic) {
    const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
    return Keypair.fromSeed(seed);
}

function getEthereumWalletFromMnemonic(mnemonic) {
    return ethers.Wallet.fromMnemonic(mnemonic);
}

// API endpoints
app.post('/api/data', async (req, res) => {
    console.log("insideyourbackend",req.body);
    const { chainName, transactionType, mnemonic, params } = req.body;

    try {
        let result;
        switch (chainName) {
            // case 'osmosis':
            // case 'akash':

            case 'cosmoshub':
                console.log("inside ",chainName);
                result = await executeCosmosTransaction(rpcEndpoints[chainName], transactionType, mnemonic, params);
                // result = "FDF3DA6332E1E066A4AAF81ED70BEDD4CCCE2DF029FEC412DDA24B47CEBCE42B";
                break;
            case 'solana':
                console.log("inside ",chainName);
                result = await executeSolanaTransaction(transactionType, mnemonic, params);
                // result = "FDF3DA6332E1E066A4AAF81ED70BEDD4CCCE2DF029FEC412DDA24B47CEBCE42B";
                break;
            case 'ethereum':
                console.log("inside ",chainName);
                result = await executeEthereumTransaction(transactionType, mnemonic, params);
                // result = "FDF3DA6332E1E066A4AAF81ED70BEDD4CCCE2DF029FEC412DDA24B47CEBCE42B";
                break;
            default:
                return res.status(400).send('Unsupported chain');
        }
        res.send({ success: true, hash: result });
    } catch (error) {
        console.error('Error executing transaction:@@@', error);
        res.status(500).send('Error executing transaction@@@@');
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
