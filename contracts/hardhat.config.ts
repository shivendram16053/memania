require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Load env variables

module.exports = {
  solidity: "0.8.24",
  networks: {
    fuji: {
      url: "",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
