import express from 'express';
import Logger from './loaders/logger';
import config from './config';
import TelegramServce from './services/telegram';
import BlockNative from 'services/blockNative';
import Web3Service from './services/web3';

const app = express();
const startServer = async() => {
    const app = express();
    
    // await require('src/loaders').default({ expressApp: app });
    const telegramService = new TelegramServce(config.telegramToken, config.telegramCh);

    const web3Service = new Web3Service(
        config.rdpProvider,
        config.uniswapV2RouterAddress, 
        config.walletPrivateKey,
        config.factoryAddress );
    await web3Service.waitUntilGetAccount();

    const blockNative = new BlockNative(0.1, config.blocknativeApiKey, web3Service, config.targetAddress, telegramService, config.networkId, config.wethAddr);
    // await blockNative.testOnGetTxOnPending();
    await blockNative.testGetBalanceOfToken();
    // await blockNative.testRopstenBuyToken();
    // await blockNative.web3SendTransactiontest()
    // app.listen(config.port, () => {
    //     Logger.info(`
    //     ################################################
    //     🛡️  Server listening on port: ${config.port} 🛡️
    //     ################################################
    //     `);
    // }).on('error', err => {
    //     Logger.error(err);
    //     process.exit(1);
    // });

    /**
     * This is a test
     */
    // blockNative.onGetTxOnPending(tx_London)
}

startServer();