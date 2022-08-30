import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (envFound.error) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  isProduction: process.env.NODE_ENV == "development" ? false : true,
  /**
   * Your favorite port
   */
  port: parseInt(<string>process.env.PORT, 10),

  /**
   * That long string from mlab
   */
  databaseURL: process.env.DATABASE_URI,

  /**
   * That uniswap V2 Router Address
   */
  uswapV2RouterAddress: process.env.uswapV2RouterAddress,

  /**
   * Used by winston logger
   */
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },

  /**
   * Blocknative account api key
   */
  blocknativeApiKey: <string>process.env.BLOCKNATIVE_API_KEY,
  
  /**
   * URL of rdp provider
   */
  rdpProvider : <string>(process.env.NODE_ENV == "development" ? process.env.RDP_PROVIDER_TEST : process.env.RDP_PROVIDER || "rdpProvider"),

  /**
   *  Uniswap V1 Router Address 
   */
  uniswapV2RouterAddress : <string>(process.env.ROUTER_ADDR || 'router addr'),
  /**
   * Wallet Private Key
   */
  walletPrivateKey : <string>(process.env.NODE_ENV == "development" ? process.env.WALLET_PRIVATE_KEY_TEST : process.env.WALLET_PRIVATE_KEY || "wallet private key"),

  /**
   * Weth address
   */
  wethAddr : <string>(process.env.NODE_ENV == "development" ? process.env.WETH_ADDR_TEST : process.env.WETH_ADDR || "weth address"),

  /**
   * Watch contract or account address
   */
  targetAddress: <string>(process.env.NODE_ENV == "development" ? process.env.TARGET_ADDR_TEST : process.env.TARGET_ADDR || "targetAddr"),
  
  /**
   * Telegram Chunnel
   */
  telegramCh: <string>(process.env.TELEGRAM_CH || "Telegram Chunnel"),

  /**
   * Telegram Token
   */
  telegramToken: <string>(process.env.TELEGRAM_TOKEN || "Telegram Token"),

   /**
   * Network Id
   */
  networkId: process.env.NODE_ENV == "development" ? 3 : 1,

   /**
   * Uniswap Factory Address
   */
  factoryAddress: process.env.NODE_ENV == "development" ? (process.env.FACTORY_ADDR_TEST || "Factory Address Test") : (process.env.FACTORY_ADDR || "Factory Address"),

};
