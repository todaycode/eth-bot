import Web3 from 'web3'
import { Account } from 'web3-core'
export default class AccountService {

    private privateKey: string;
    private web3Instance: Web3;
    constructor(privateKey: string, web3Instance: Web3) {
        this.privateKey = privateKey
        this.web3Instance = web3Instance
    }

    async getAccount() : Promise<Account>{
        return await this.web3Instance.eth.accounts.privateKeyToAccount(this.privateKey)
    }

    async getAddress() : Promise<string> {
        return (await this.web3Instance.eth.accounts.privateKeyToAccount(this.privateKey)).address
    }
} 