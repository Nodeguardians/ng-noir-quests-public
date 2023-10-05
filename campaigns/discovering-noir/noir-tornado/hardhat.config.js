require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
      version: "0.8.19",
      settings: {
        evmVersion: "london",
        optimizer: { enabled: true, runs: 5000 },
      },
    },
};