import BlocknativeSdk from 'bnc-sdk';
import { InitializationOptions, Emitter, EthereumTransactionData, BitcoinTransactionData, ContractCall, Transaction, Account, Event, Unsubscribe, Destroy, Configuration, TransactionData, TransactionEventLog , TransactionEvent} from 'bnc-sdk/dist/types/src/types';
import config from '../config';
import WebSocket from 'ws'
import { loggers } from 'winston';
import Logger from '../loaders/logger';
import Web3Service from './web3';
import TelegramServce from './telegram';
import unswRouterConractAbi from '../constants/abis/RouterContract'
import {
    LEGACY,
    LONDON_HARD_FORK}   from '../constants'
import AccountService   from './account'
import { TransactionConfig, SignedTransaction, TransactionReceipt }  from 'web3-core'
import londonHFTransaction from '../testData'
export default class blockNative {

    private options     : InitializationOptions;
    // private blocknative : BlocknativeSdk;
    // private emitter     : Emitter;
    private boughtTokenOnCache: string[];
    private sellTokenOnCache: string[];
    private boughtToken: string[];
    private sellToken: string[];
    private web3Service:Web3Service;
    private wethAddr: string;
    private telegramService: TelegramServce;
    private blocknative: BlocknativeSdk;
    private emitter: Emitter;
    private walletAddr: string;
    private targetAddr: string;
    private gasLimitDelta: number;
    private gasPriceDelta: number;
    private maxFeePerGasDelta: number;
    private maxPriFeePerGasDelta: number;
    private minTokenAmountToBuy: number;
    private eth: number;

    constructor(eth: number, blockNativeApiKey: string, web3Service: Web3Service, targetAddr: string, telegramService: TelegramServce, networkId: number, wethAddr: string) {

        this.boughtTokenOnCache = [];
        this.sellTokenOnCache   = [];
        this.boughtToken = [];
        this.sellToken   = [];
        this.web3Service = web3Service;
        this.wethAddr   = wethAddr;
        this.telegramService = telegramService;
        this.walletAddr = web3Service.getWalletAddr();
        this.targetAddr = targetAddr;

        /*------------------ Set gasLimit, fee delta to add for jump -S------------------------*/
        this.gasLimitDelta = 1000;
        this.gasPriceDelta = 1000;
        this.maxFeePerGasDelta = 10;
        this.maxPriFeePerGasDelta = 10;
        /*------------------ Set gasLimit, fee delta to add for jump -E------------------------*/
        this.minTokenAmountToBuy = 10;

        this.eth = eth;

        this.options     = {
            dappId      : blockNativeApiKey,
            networkId   : networkId,
            system      : 'ethereum', // optional, defaults to ethereum
            ws          : WebSocket, // only neccessary in server environments 
            name        : 'BlockNativeInstance', // optional, use when running multiple instances
            onerror     : (error) => this.telegramService.sendErr(`Error in block native. ${JSON.stringify(error)}`)
            // transactionHandlers : [event => console.log(event.transaction)],
            // onerror             : (error) => {console.log(error)} //optional, use to catch errors

        }
        this.blocknative = new BlocknativeSdk(this.options)

        const { emitter, details } = this.blocknative.account(this.targetAddr);
        // const { emitter, details } = this.blocknative.account(this.walletAddr);

        this.emitter = emitter;
        // console.log("before emitter")
        emitter.on('txPool',  (transaction) => this.onGetTxOnPending(transaction, this.telegramService))
        // emitter.on('txPoolSimulation', (transaction) => this.onGetTxOnPendingSimul(transaction, this.telegramService));
        // emitter.on('txConfirmed', (transaction) => this.onGetTxOnConfirm(transaction, this.telegramService))
        // emitter.on('txPoolSimulation', this.onGetTxOnPendingSimul);
        // emitter.on('txConfirmed', this.onGetTxOnConfirm)
    }

    onGetTxOnPending(transaction: TransactionData | TransactionEventLog, telegramService: TelegramServce): void {
        // console.time('onGetFromMempoolExcute');
        const now = new Date();
        
        const ethTx     :EthereumTransactionData= <EthereumTransactionData> transaction;
        // const bitCoinTx :BitcoinTransactionData = <BitcoinTransactionData> transaction;
        const system = ethTx.system

        
        if(system !== "ethereum"){
            // telegramService.sendMsg("Error! This transaction is ethereum transaction")
            return;
        }

        const contractCall = ethTx.contractCall
        if(!contractCall){ 
            // telegramService.sendMsg("Error! This transaction is not for contract call!")
            return;
        }

        const mthdName  : string                = contractCall.methodName
        const params    : any                   = contractCall.params;
        const tokenAddr : string | undefined    = params?.path?.length > 1 ? params.path[1] : undefined;
        const value     : string                = ethTx.value
        let gas               : number          = 0
        let gasPrice          : string          = '0'
        let gasPriceGwei      : number          = 0
        let maxFeePerGasGwei  : number          = 0
        let maxPriorityFeePerGasGwei : number   = 0;
        let deadline          : number          = (params?.deadline ? parseInt(params.deadline) : (new Date()).getTime()) + 30;

        
        if(mthdName === undefined || params === undefined || tokenAddr === undefined) {
            // telegramService.sendMsg("Error! This transaction is not for exchange!")
            return;
        };
        telegramService.sendMsgFromTx(ethTx, "in pending")
        // telegramService.sendRawTx(ethTx)
        if(ethTx.maxFeePerGasGwei && ethTx.maxPriorityFeePerGasGwei){
            maxFeePerGasGwei         = ethTx.maxFeePerGasGwei + this.maxFeePerGasDelta;
            maxPriorityFeePerGasGwei = ethTx.maxPriorityFeePerGasGwei + this.maxPriFeePerGasDelta;
            gas = ethTx.gas + this.gasLimitDelta;
            this.web3Service.setMode(LONDON_HARD_FORK)
        } else if(ethTx.gasPrice && ethTx.gas) {
            gasPrice = (parseFloat(ethTx.gasPrice) + this.gasPriceDelta).toString();
            gas      = ethTx.gas + this.gasLimitDelta;
            this.web3Service.setMode(LEGACY)
        } else {
            telegramService.sendMsg("Transaction information is not Legacy or London...")
            return;     //discuss
        }
        
        switch(mthdName) {
            /*------- Swap Token to Token -S-------*/
            case 'swapExactTokensForTokens':
            case 'swapTokensForExactTokens':
            case 'swapExactTokensForTokensSupportingFeeOnTransferTokens':
                this.telegramService.sendMsg(` This transaction has canceled because this is a Token to token swap transaction`)
                break;
            /*------- Swap Token to Token -E-------*/

            /*------- Swap Token to Eth -S---------*/
            case 'swapTokensForExactETH':
            case 'swapExactTokensForETHSupportingFeeOnTransferTokens':
            case 'swapExactTokensForETH':
                // this.sellEthTokenFollowTx(ethTx, contractCall, mthdName, params, tokenAddr)
                this.telegramService.sendMsg(` This transaction has canceled because this is a sell token swap transaction`)
                break;
            /*------- Swap Token to Eth -E---------*/

            /*------- Swap ETH to Token -S---------*/
            case 'swapExactETHForTokens':
            case 'swapETHForExactTokens':
            case 'swapExactETHForTokensSupportingFeeOnTransferTokens':
                /*-------------- get amount of ether to sell, amount of token to buy from transaction -S-------------*/
                this.buyTokenByExactToken(this.eth, tokenAddr, deadline, gas, gasPrice, Web3Service.gweiToWei(maxPriorityFeePerGasGwei), Web3Service.gweiToWei(maxFeePerGasGwei))
                break;
            /*------- Swap ETH to Token -E---------*/
        
        }
        // this.boughtTokenOnCache.push(tokenAddr);
    }

    onGetTxOnPendingSimul(transaction: TransactionData | TransactionEventLog, telegramService: TelegramServce): void {

    }

    onGetTxOnConfirm(transaction: TransactionData | TransactionEventLog, telegramService: TelegramServce): void {
        const ethTx     :EthereumTransactionData= <EthereumTransactionData> transaction;
        this.telegramService.sendMsgFromTx(ethTx, "confirmed")

    }

    buyEthTokenFollowTx(ethTx: EthereumTransactionData, contractCall: ContractCall | undefined, mthdName: string | undefined, params: any, tokenAddr: string | undefined):void {
        
        if(!tokenAddr || this.boughtToken.includes(tokenAddr) || this.boughtTokenOnCache.includes(tokenAddr)) {
            this.telegramService.sendMsg(`Token ${tokenAddr} is bought token so buy action stopped!`);
            return
        }

        const amountOut      : number = params?.amountOut;
        const estimatedGas   : number = 1000000;
        
        let value            : string = ethTx.value;
        let gasPrice         : number = 0;
        let gas              : number = 0;
        let gasPriceGwei     : number = 0;
        let maxFeePerGasGwei : number = 0;
        let deadline         : number = (params?.deadline ? parseInt(params.deadline) : (new Date()).getTime()) + 30;
        let maxPriorityFeePerGasGwei: number = 51;

        if(ethTx?.maxFeePerGasGwei && ethTx?.maxPriorityFeePerGasGwei){
            maxFeePerGasGwei         = ethTx.maxFeePerGasGwei + 10;
            maxPriorityFeePerGasGwei = ethTx.maxPriorityFeePerGasGwei + 10

            this.web3Service.setMode(LONDON_HARD_FORK)
        } else if(ethTx?.gasPriceGwei) {
            gasPriceGwei = ethTx.gasPriceGwei + 50;
            this.web3Service.setMode(LEGACY)
        } else {
            this.telegramService.sendMsg(`Transaction information is not Legacy or London...`);
            return;     //discuss
        }
        
        this.boughtTokenOnCache.push(tokenAddr);
        //buy
        this.web3Service.createBuyTokenObj(amountOut, this.wethAddr, tokenAddr, this.web3Service.getWalletAddr(), deadline)
        // this.web3Service.createSwapTx(estimatedGas, gasPriceGwei * 10 ** 9, amountOut, maxPriorityFeePerGasGwei * 10 ** 9, maxFeePerGasGwei * 10 ** 9)
        // this.web3Service.sendTransaction().then(() =>{
        //     this.boughtToken.push(tokenAddr)
        // })
        return;
    }

    sellEthTokenFollowTx(ethTx: EthereumTransactionData, contractCall: ContractCall | undefined, mthdName: string | undefined, params: any, tokenAddr: string | undefined): void {
        
        if(!tokenAddr || this.sellToken.includes(tokenAddr) || this.sellTokenOnCache.includes(tokenAddr)) {
            Logger.info(`Token ${tokenAddr} is bought token so buy action stopped!`);
            return
        }

        const amountIn : number = params?.amountIn;
        const amountOutMin = params?.amountOutMin;
        const estimatedGas   : number = 1000000;
        
        let value            : string = ethTx.value;
        let gasPrice         : number = 0;
        let gas              : number = 0;
        let gasPriceGwei     : number = 0;
        let maxFeePerGasGwei : number = 0;
        let deadline         : number = (params?.deadline ? parseInt(params.deadline) : (new Date()).getTime()) + 30;
        let maxPriorityFeePerGasGwei: number = 51;

        if(ethTx?.maxFeePerGasGwei && ethTx?.maxPriorityFeePerGasGwei){
            maxFeePerGasGwei         = ethTx.maxFeePerGasGwei + 10;
            maxPriorityFeePerGasGwei = ethTx.maxPriorityFeePerGasGwei + 10

            this.web3Service.setMode(LONDON_HARD_FORK)
        } else if(ethTx?.gasPriceGwei) {
            gasPriceGwei = ethTx.gasPriceGwei + 50;
            this.web3Service.setMode(LEGACY)
        } else {
            this.telegramService.sendMsg(`Transaction information is not Legacy or London...`);
            return;     //discuss
        }
        this.sellTokenOnCache.push(tokenAddr);
        //sell
        this.web3Service.createSellTokenObj(amountIn, amountOutMin, this.wethAddr, tokenAddr, this.web3Service.getWalletAddr(), deadline)
        // this.web3Service.createSwapTx(estimatedGas, gasPriceGwei * 10 ** 9, amountIn, maxPriorityFeePerGasGwei * 10 ** 9, maxFeePerGasGwei * 10 ** 9)
        // this.web3Service.sendTransaction().then(() =>{
        //     this.sellToken.push(tokenAddr)
        // })
    }

    async buyTokenByExactToken(eth: number, tokenAddr: string, deadline: number, gas: number, gasPrice: string, maxPriFeePerGas: number, maxFeePerGas: number){
        if(!tokenAddr || this.boughtToken.includes(tokenAddr)) {
            this.telegramService.sendErrMessage("Boy token has canceled because this token is bought token");
            return
        }
        this.web3Service.createBuyTokenObj(this.minTokenAmountToBuy, this.wethAddr, tokenAddr, this.web3Service.getWalletAddr(), deadline);
        this.web3Service.createSwapTx(eth, gas, gasPrice, maxPriFeePerGas, maxFeePerGas);
        this.telegramService.sendMsgFromTxConfig(this.web3Service.getSwapTransaction())
        // this.telegramService.sendMsg(`Sending transaction!
        //     ${JSON.stringify(this.web3Service.getSwapTransaction())}`)

        try{
            // console.timeEnd('onGetFromMempoolExcute')
            this.boughtToken.push(tokenAddr)
            console.log("in try", this.boughtToken)
            const result = await this.web3Service.sendTransaction(this.web3Service.getSwapTransaction());

        }
        catch(e:any){
            const index = this.boughtToken.indexOf(tokenAddr);
            this.boughtToken.splice(index, 1);
            console.log("in catch", this.boughtToken)

            this.telegramService.sendErrMessage(e);
        }
    }

    async web3SendTransactiontest(){
        const txOptions:TransactionConfig = {
            from     : this.walletAddr,
            to       : this.targetAddr,
            gas      : 600000,
            gasPrice : Web3Service.gweiToWei(230),
            value    : Web3Service.etherToWei(0.000001),
          }
        const hash = await this.web3Service.sendTransaction(txOptions)
        // web3.eth.sendTransaction(txOptions).on('transactionHash', hash => {
        //     // call with the transaction hash of the
        //     // transaction that you would like to receive status updates for
        //     const { emitter } = blocknative.transaction(hash)
          
        //     // listen to some events
        //     emitter.on('txPool', transaction => {
        //       console.log(`Sending ${transaction.value} wei to ${transaction.to}`)
        //     })
          
        //     emitter.on('txConfirmed', transaction => {
        //       console.log('Transaction is confirmed!')
        //     })
          
        //     // catch every other event that occurs and log it
        //     emitter.on('all', transaction => {
        //       console.log(`Transaction event: ${transaction.eventCode}`)
        //     })
    }

    // async testRopstenBuyToken(){
    //     console.log(process.env.NODE_ENV)
    //     const tokenAddr = '0x46aff14b22e4717934edc2cb99bcb5ea1185a5e8'
    //     // console.log(await this.web3Service.getTokenData(tokenAddr))
    //     console.log(await this.web3Service.getAllPairsLengthInUniswap())

    // }

    async testOnGetTxOnPending() {
        this.onGetTxOnPending(londonHFTransaction, this.telegramService)
    }

    async testGetBalanceOfToken(){
        const tokenAddr: string = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
        const balance = await this.web3Service.getBalanceOfToken(tokenAddr)
        console.log("balance is ", balance)
        return balance
    }

}