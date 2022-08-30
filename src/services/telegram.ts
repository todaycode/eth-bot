const TelegramBot = require('node-telegram-bot-api');
import { TransactionConfig, SignedTransaction, TransactionReceipt }  from 'web3-core'
import { InitializationOptions, Emitter, EthereumTransactionData, BitcoinTransactionData, ContractCall, Transaction, Account, Event, Unsubscribe, Destroy, Configuration, TransactionData, TransactionEventLog } from 'bnc-sdk/dist/types/src/types';
import Logger from '../loaders/logger';
import config from '../config';
import Web3Service from './web3'

export default class TelegramServce {

    token: string = <string>process.env.TELEGRAM_TOKEN;
    bot: any;
    channel: string = <string>process.env.TELEGRAM_CH;

    constructor(token: string, channel: string){
        this.token = token;
        this.bot = new TelegramBot(token)
        this.channel = channel
    }

    getBot():any {
        return this.bot
    }

    sendMsgByChl(channel: string, msg: string): void {
        this.bot.sendMessage(channel, msg);
    }

    sendMsg(msg: string): void {
        // this.bot.sendMessage(this.channel, msg);
        // Logger.info(msg)
        let env = process.env.NODE_ENV
        if(config.isProduction) this.bot.sendMessage(this.channel, msg);
        else Logger.info(msg)
    }
    sendMsgFromTx(tx: EthereumTransactionData, event: string) {
        const status        = tx.status;
        const now           = new Date();
        const hash          = tx.hash;
        const value         = tx.value;
        const target        = tx.contractCall?.params.to;
        const path:any      = tx.contractCall?.params?.path
        const tokenAddr     = path?.length > 0 ? path[1] : null;
        const contractType  = tx.contractCall?.contractType;
        const methodName    = tx.contractCall?.methodName;
        const amountOut     = tx.contractCall?.params.amountOut;
        const amountIn      = tx.contractCall?.params.amountIn;
        const tokenName     = "Token name is empty";
        const gasLimit      = tx?.gas
        const gasPrice      = tx?.gasPrice
        const maxFeePerGas  = Web3Service.gweiToWei(tx?.maxFeePerGasGwei)
        const totalSupply   = undefined;
        const maxPriorityFeePerGas = Web3Service.gweiToWei(tx?.maxPriorityFeePerGasGwei)
        
        const msg: string = `
            New Token ${event}
            Status : ${status}
            Time : ${now.getMonth()+1}-${now.getDate()}-${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}
            Hash : ${hash}
            Value : ${Web3Service.weiToEther(value)} Eth
            Target : ${target}
            Token Name : ${tokenName}
            Contract Type: ${contractType}
            Method Name: ${methodName}
            Amount Out : ${amountOut}
            Amount In : ${amountIn}
            Gas Limit: ${gasLimit} Wei
            Gas Price: ${gasPrice} Wei
            Max Fee Per Gas : ${maxFeePerGas} Wei
            Max Priority Fee Per Gas: ${maxPriorityFeePerGas} Wei
            Total Supply : ${totalSupply}
            Amount % : ${undefined}
        `;
        // this.bot.sendMessage(this.channel, msg)
        this.sendMsg(msg)
        
    }
    sendRawTx(tx: EthereumTransactionData){
        this.sendMsg(JSON.stringify(tx));
    }
    sendMsgFromTxConfig(txConfig: TransactionConfig){
        const msg: string = `
            Transaction config to send
            From: ${txConfig?.from}
            To: ${txConfig?.to}
            Value: ${Web3Service.weiToEther(txConfig?.value)} Eth
            Gas Limit: ${txConfig?.gas} Wei
            Gas Price: ${txConfig?.gasPrice} Wei
            Max Fee Per Gas: ${txConfig?.maxFeePerGas} Wei
            Max Priority Fee Per Gas: ${txConfig?.maxPriorityFeePerGas} Wei
        `;
        this.sendMsg(msg)

    }
    sendErrMessage(e: any){
        const msg: string = `
            Error
            ${e.message}
        `
        this.sendMsg(msg)
    }

    sendErr(msg: string): void{
        this.sendMsg(`Error! \n ${msg}`);

    }

}