import { InitializationOptions, Emitter, EthereumTransactionData, BitcoinTransactionData, ContractCall, Transaction, Account, Event, Unsubscribe, Destroy, Configuration, TransactionData, TransactionEventLog , TransactionEvent} from 'bnc-sdk/dist/types/src/types';

const tx_London: EthereumTransactionData = {
    status: 'pending',
    monitorId: 'Geth_1_F_PROD',
    monitorVersion: '0.114.0',
    gasPrice: '0',                                            //added
    // pendingTimeStamp: '2022-03-24T22:54:10.459Z',
    // pendingBlockNumber: 14451770,
    hash: '0x9d4ec2c5d3a8844d45870fbfb928ef53bcca90d1d7c92bf70011e6a6bcf8e4c5',
    from: '0x1339063eaAC9c553654e04ad1E7C5D4A6CAffB42',
    to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    value: '25',
    gas: 505922,
    nonce: 659,
    blockHash: null,
    blockNumber: null,
    v: '0x0',
    r: '0x9d44938f3a37f4c666eb9fa963a56759cbe482916a938324bcd2d9500df906df',
    s: '0x59da68efa6166f9d9cda91335f3bdad18ec7a3650a9d7e259855c2a21111e60',
    input: '0xfb3bdb410000000000000000000000000000000000000000000000000007192ba042e00000000000000000000000000000000000000000000000000000000000000000800000000000000000000000001339063eaac9c553654e04ad1e7c5d4a6caffb4200000000000000000000000000000000000000000000000000000000623d22200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000002e1311220248c0e9dca0bc080521f0ba8bfc12ff',
    // type: 2,
    // maxFeePerGas: '45608864010',
    maxFeePerGasGwei: 45.6,
    // maxPriorityFeePerGas: '2000000000',
    maxPriorityFeePerGasGwei: 2,
    asset: '',
    // estimatedBlocksUntilConfirmed: 2,
    watchedAddress: '0x1339063eaac9c553654e04ad1e7c5d4a6caffb42',
    direction: 'outgoing',
    counterparty: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    serverVersion: '0.132.0',
    eventCode: 'txPool',
    timeStamp: '2022-03-24T22:54:10.459Z',
    dispatchTimestamp: '2022-03-24T22:54:10.471Z',
    system: 'ethereum',
    network: 'main',
    contractCall: {
        contractName: '',
        contractType: 'Uniswap V2: Router 2',
        contractAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        methodName: 'swapETHForExactTokens',
        params: {
            amountOut: '1848093679662521974',
            path: [
            "0xc778417E063141139Fce010982780140Aa0cD5Ab",
            "0x101848D5C5bBca18E6b4431eEdF6B95E9ADF82FA"
            ],
            to: '0x1339063eaAC9c553654e04ad1E7C5D4A6CAffB42',
            deadline: '1648273600'
        }
    }
}

// export const tx_London2: EthereumTransactionData = {
//     "status": "pending",
//     "monitorId": "nethermind_1_a0_prod",
//     "monitorVersion": "0.116.0",
//     "hash": "0xe32a59c74ae7777b62857e8fc2fd845d6468d8c87c7b9ba15f792d10c2c9f561",
//     "from": "0x8441B1F529Ac00812826b4f6fb41C86ABB84B86d",
//     "to": "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
//     "value": "0",
//     "gas": 177668,
//     "nonce": 50,
//     "blockHash": null,
//     "blockNumber": null,
//     "v": "0x0",
//     "r": "0x62d736723807c8199596e865fd47f23c3f66408245866955e24f50d82e447480",
//     "s": "0xa32773865cdc91842c5c48566ff5b86496e5f36bda4beca0416b202567d67fc",
//     "input": "0x18cbafe500000000000000000000000000000000000000000000000000000000468716700000000000000000000000000000000000000000000000000864a0f9b091ede600000000000000000000000000000000000000000000000000000000000000a00000000000000000000000008441b1f529ac00812826b4f6fb41c86abb84b86d0000000000000000000000000000000000000000000000000000000062f99bce0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
//     "maxFeePerGasGwei": 26.8,
//     "maxPriorityFeePerGasGwei": 1.5,
//     "asset": "",
//     "watchedAddress": "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f",
//     "direction": "incoming",
//     "counterparty": "0x8441B1F529Ac00812826b4f6fb41C86ABB84B86d",
//     "serverVersion": "0.145.0",
//     "eventCode": "txPool",
//     "timeStamp": "2022-08-15T00:35:47.219Z",
//     "dispatchTimestamp": "2022-08-15T00:35:47.231Z",
//     "system": "ethereum",
//     "network": "main",
//     "contractCall": {
//       "contractType": "Uniswap V2: Router 2",
//       "contractAddress": "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
//       "methodName": "swapExactTokensForETH",
//       "params": {
//         "amountIn": "1183258224",
//         "amountOutMin": "604785244244143590",
//         "path": [
//           "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
//           "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
//         ],
//         "to": "0x8441B1F529Ac00812826b4f6fb41C86ABB84B86d",
//         "deadline": "1660525518"
//       },
//       "contractName": "SushiSwap: Router"
//     }
//   }
export default tx_London;
  