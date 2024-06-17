import { task, vars } from "hardhat/config";
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
  solidity: {
    version: "0.8.8",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
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
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${vars.get("ALCHEMY_API_KEY")}`,
      accounts: [
        vars.get("TEST_PRIVATE_KEY")
      ],
    },
    base_goerli: {
      url: "https://goerli.base.org",
      accounts: [
        vars.get("TEST_PRIVATE_KEY")
      ],
      verify: {
        etherscan: {
          apiUrl: "https://api-goerli.basescan.org",
          apiKey: vars.get("EXPLORER_API_KEY")
        }
      }
    },
    base_sepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/${vars.get("ALCHEMY_SEPOLIA_KEY")}`,
      accounts: [
        // vars.get("TEST_PRIVATE_KEY")
        vars.get("PROD_PRIVATE_KEY")
      ],
      verify: {
        etherscan: {
          apiUrl: "https://api-sepolia.basescan.org",
          apiKey: vars.get("EXPLORER_API_KEY")
        }
      }
    },
    base: {
      url: `https://base-mainnet.g.alchemy.com/v2/${vars.get("ALCHEMY_BASE_API_KEY")}`,
      accounts: [
         vars.get("TEST_PRIVATE_KEY")
        // vars.get("PROD_PRIVATE_KEY")
      ],
      verify: {
        etherscan: {
          apiUrl: "https://api.basescan.org",
          apiKey: vars.get("EXPLORER_API_KEY")
        }
      }
    }
  },
};
