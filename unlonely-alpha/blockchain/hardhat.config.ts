import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "hardhat-watcher";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "@openzeppelin/hardhat-upgrades";
import "dotenv";
import "hardhat-deploy";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.8",
  namedAccounts: {
    deployer: 0,
  },

  paths: {
    artifacts: "artifacts",
  },

  watcher: {
    compile: {
      tasks: ["compile"],
    },
    test: {
      tasks: [
        { command: "compile" },
        { command: "test", params: { noCompile: true } },
      ],
      files: ["test/**/*", "contracts/**/*"],
    },
  },

  typechain: {
    outDir: "typechain-types",
    target: "ethers-v5",
  },

  networks: {
    hardhat: {
      chainId: 1337, // REF: https://hardhat.org/metamask-issue.html
    },
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/ULCyunLDcNW53XFkRWRKLLrFpOPofWiT",
      accounts: [
        "deb65044913e5f8f24e1407c4e4abea0873e07bcdeabab477d931e9e4825cdd2",
      ],
    },
    mumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/a1bbMNkXZ1P7DQAdUZBo2kboXihjBqDY",
      accounts: [
        "deb65044913e5f8f24e1407c4e4abea0873e07bcdeabab477d931e9e4825cdd2",
      ],
    },
    matic: {
      url: "https://polygon-mainnet.g.alchemy.com/v2/QaFNUobXWyTgqnqFD_vKFEoy0oW8oB76",
      accounts: [
        "deb65044913e5f8f24e1407c4e4abea0873e07bcdeabab477d931e9e4825cdd2",
      ],
    },
    mainnet: {
      url: "https://eth-mainnet.g.alchemy.com/v2/45C69MoK06_swCglhy3SexohbJFogC9F",
      accounts: [
        "deb65044913e5f8f24e1407c4e4abea0873e07bcdeabab477d931e9e4825cdd2",
      ],
    },
    base_goerli: {
      url: "https://goerli.base.org",
      accounts: [
        // "deb65044913e5f8f24e1407c4e4abea0873e07bcdeabab477d931e9e4825cdd2",
      ],
      verify: {
        etherscan: {
          apiUrl: "https://api-goerli.basescan.org",
          apiKey: "YI2EP6PXGKQ614AJABB3W5FRG8TSG539E9"
        }
      }
    },
    base_sepolia: {
      url: "https://base-sepolia.g.alchemy.com/v2/y-6uxcy5eHDKqKKBmvmFXbGxe7E5Z0gd",
      accounts: [
        // "deb65044913e5f8f24e1407c4e4abea0873e07bcdeabab477d931e9e4825cdd2",
        "a56ca0f8d1737207afa59328b3d5a282806434d08f35f2e7f7b41084c0ad3704"
      ],
      verify: {
        etherscan: {
          apiUrl: "https://api-sepolia.basescan.org",
          apiKey: "YI2EP6PXGKQ614AJABB3W5FRG8TSG539E9"
        }
      }
    },
    base: {
      url: "https://base-mainnet.g.alchemy.com/v2/aR93M6MdEC4lgh4VjPXLaMnfBveve1fC",
      accounts: [
        // "deb65044913e5f8f24e1407c4e4abea0873e07bcdeabab477d931e9e4825cdd2",
        "a56ca0f8d1737207afa59328b3d5a282806434d08f35f2e7f7b41084c0ad3704"
      ],
      verify: {
        etherscan: {
          apiUrl: "https://api.basescan.org",
          apiKey: "YI2EP6PXGKQ614AJABB3W5FRG8TSG539E9"
        }
      }
    }
  },
};
