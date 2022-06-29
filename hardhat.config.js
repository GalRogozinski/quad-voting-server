/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('@nomiclabs/hardhat-ethers')


const config = {
    defaultNetwork: 'local',
    networks: {
        local: {
            url: "http://localhost:8545",
            accounts: ["0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3"],
            loggingEnabled: false,
        },
        remote: {
            url: "http://quadvoting.twilightparadox.com:8545",
            accounts: ["0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3"],
            loggingEnabled: false,
        }
    },
    paths: {
        sources: "quad-voting-maci/contracts/contracts/",
        artifacts: "quad-voting-maci/contracts/artifacts"
    }
};

module.exports = config;