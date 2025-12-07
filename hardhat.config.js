require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        coston2: {
            url: "https://coston2-api.flare.network/ext/C/rpc",
            chainId: 114
        },
    },
};
