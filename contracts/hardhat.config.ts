require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  networks: {
    somnia: {
      url: "https://dream-rpc.somnia.network",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
