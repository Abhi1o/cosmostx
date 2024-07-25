const chainConfig = {
    rpcEndpoint: 'http://localhost:8080/',
    prefix: 'cosmos',
    denom: 'uatom', // smallest unit of ATOM
    feeAmount: '10000', // in uatom
    gas: '200000'
};

module.exports = chainConfig;
