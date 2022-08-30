import Web3         from 'web3'
import { AbiItem }  from 'web3-utils'
import {Contract}   from 'web3-eth-contract';
import { Account, TransactionConfig, SignedTransaction, TransactionReceipt }  from 'web3-core'
import config from '../config';

import AccountService   from './account'
import {
    LEGACY,
    LONDON_HARD_FORK}   from '../constants'
import unswRouterConractAbi from '../constants/abis/RouterContract'
import factoryContractAbi from '../constants/abis/Factory'
import Erc20Abi from '../constants/abis/ERC20'
import BN = require('bn.js');
export default class Web3Service {

    private web3            : Web3;
    private contract        : Contract;
    private walletAccount   : Account | undefined = undefined;
    private walletPrvKey    : string;
    private mode            : number;
    private swapObj         : any;
    private swapTx          : TransactionConfig;
    // private factoryContract : Contract;

    constructor(
        rdpProvider         : string,
        contractAddr        : string,
        walletPrvKey        : string,
        factoryAddr         : string,
    ){

        this.mode           = LEGACY;
        this.walletPrvKey   = walletPrvKey
        this.web3           = new Web3(rdpProvider)
        this.contract       = new this.web3.eth.Contract(unswRouterConractAbi, contractAddr);
        // this.factoryContract=new this.web3.eth.Contract(factoryContractAbi, factoryAddr);
        this.swapTx         = {};

        // const walletAccSrv  = new AccountService(walletPrvKey, this.web3);
        // walletAccSrv.getAccount().then((result) => this.walletAccount = result)

    }
    async waitUntilGetAccount(){
        const walletAccSrv  = new AccountService(this.walletPrvKey, this.web3);
        this.walletAccount = await walletAccSrv.getAccount()
    }
    getWeb3(): Web3 {
        return this.web3
    }

    getContract(): Contract {
        return this.contract
    }

    // getFactoryContract(): Contract {
    //     return this.factoryContract
    // }

    getWalletAddr(): string {
        return <string>this.walletAccount?.address
    }
    getSwapTransaction(): TransactionConfig {
        return this.swapTx
    }
    async getBalanceOfToken(tokenAddr: string) : Promise<number>{
        const ERC20Contract  = new this.web3.eth.Contract(Erc20Abi, tokenAddr);
        const balance        = await ERC20Contract.methods.balanceOf(this.getWalletAddr()).call();
        return balance
    }

    async getTokenData(tokenAddr: string) : Promise<Object> {
        const ERC20Contract  = new this.web3.eth.Contract(Erc20Abi, tokenAddr);

        const tokenName     = await ERC20Contract.methods.name().call();
        const tokenSymbol   = await ERC20Contract.methods.symbol().call();
        const totalSupply   = await ERC20Contract.methods.totalSupply().call();
        const decimals      = await ERC20Contract.methods.decimals().call()
        const balance       = await ERC20Contract.methods.balanceOf(this.getWalletAddr()).call();
        return {
            name: tokenName,
            symbol: tokenSymbol,
            totalSupply: totalSupply,
            decimals: decimals
        }
    }
    
    createBuyTokenObj(minAmountToken:number = 100, wethAddr: string, tokenAddr: string, accountAddr: string, deadline: number ){
        // console.log("swap obj data");
        // console.log("amount token : ", amountToken);
        // console.log("weth addr : ", wethAddr);
        // console.log("token addr", tokenAddr);
        // console.log("account addr : ", accountAddr);
        // console.log("dead line : ", deadline)
        this.swapObj = {}
        const swapObj = this.contract.methods.swapExactETHForTokens(
            minAmountToken,
            [wethAddr, tokenAddr],
            accountAddr,
            deadline
        )
        this.swapObj  = swapObj;
    }

    createSellTokenObj(amountToken: number, amountOutMin: number, wethAddr: string, tokenAddr: string, accountAddr: string, deadline: number, ){
        const swapObj   = this.contract.methods.swapETHForExactTokens(
            amountToken,
            amountOutMin,
            [tokenAddr, wethAddr],
            accountAddr,
            deadline
        )
        this.swapObj    = swapObj;
    }

    setMode(mode: number): void {
        this.mode = mode;
    }

    getMode(): number{
        return this.mode;
    }

    getModeInString(): string{
        if(this.mode == LEGACY) return "LEGACY";
        else return "London Hard Fork"
    }

    createSwapTxInLegacy(gas: number, gasPrice: string, ethValue: number): void {
        const swapTx: TransactionConfig = {
            to       : this.swapObj._parent._address,
            gas      : gas,
            gasPrice : gasPrice,
            data     : this.swapObj.encodeABI(),
            value    : Web3Service.etherToWei(ethValue),
        }
        this.mode   = LEGACY;
        this.swapTx = swapTx;
    }

    createSwapTxInLondonHF(maxPriorityFeePerGas: number, maxFeePerGas: number, gas: number, ethValue: number){
        // console.log("max priority fee per gas : ", maxPriorityFeePerGas)
        // console.log("to: ", this.swapObj._parent._address)
        // console.log("gas: ", gas)
        // console.log("data:", this.swapObj.encodeABI())
        const swapTx: TransactionConfig = {
            to      : this.swapObj._parent._address,
            gas     : gas,
            data    : this.swapObj.encodeABI(),
            value   : Web3Service.etherToWei(ethValue),
            maxFeePerGas         : maxFeePerGas,
            maxPriorityFeePerGas : maxPriorityFeePerGas,
        }
        this.mode   = LONDON_HARD_FORK;
        this.swapTx = swapTx;
    }

    createSwapTx(eth: number, gas: number, gasPrice: string, maxPriorityFeePerGas: number, maxFeePerGas: number) {
        switch(this.mode){
            case LEGACY :
                this.createSwapTxInLegacy(gas, gasPrice, eth)
                break;
            case LONDON_HARD_FORK :
                this.createSwapTxInLondonHF(maxPriorityFeePerGas, maxFeePerGas, gas, eth)
                break;
        }
    }

    async sendTransaction(transactionConfig: TransactionConfig): Promise<TransactionReceipt>  {

        // const signedTx: SignedTransaction = await this.web3.eth.accounts.signTransaction(this.swapTx, this.walletPrvKey);
        const signedTx: SignedTransaction = await this.web3.eth.accounts.signTransaction(transactionConfig, this.walletPrvKey);
        // const signedTx: SignedTransaction = await this.walletAccount.signTransaction(this.swapTx)
        const res = await this.web3.eth.sendSignedTransaction(<string>signedTx.rawTransaction)
        return res;
    }

    // async getAllPairsLengthInUniswap() {
    //     await this.factoryContract.methods.allPairsLength().call()
    // }
    static etherToWei(ether: number | undefined): number {
        if(ether == undefined) return 0;
        return ether * Math.pow(10, 18);
    }
    static weiToEther(wei: string | number | BN | undefined): number {

        if(typeof(wei) === 'string') wei = parseFloat(wei)
        if(BN.isBN(wei)) wei = wei.toNumber();
        if(wei == undefined) return 0;
        return wei / Math.pow(10, 18);
    }
    static etherToGwei(ether: number | undefined): number{
        if(ether == undefined) return 0;
        return ether * Math.pow(10,9);
    }
    static gweiToWei(gwei: number | undefined): number{
        if(gwei == undefined) return 0;
        return gwei * Math.pow(10, 9);
    }
    
    // async sendTransactionByOption(transactionConfig:TransactionConfig): Promise<TransactionReceipt>  {

    //     return await this.web3.eth.sendTransaction(transactionConfig)
    // }
}