# Environment Variables

To use environment variables you'll need to run the following in this
folder(blockchain):

`vercel link`

This prompts you to link a project. After a couple `Yes` when prompted with:

> What’s the name of your existing project?

enter: `newsapp`

After you're linked in this folder (blockchain) simply run:

`vercel env pull`

This will pull down only the environment variables marked for development into
an `.env` file. You can learn more [here](https://vercel.com/docs/cli).

# Contract Deployment

Added a few deployment scripts:

```
yarn run deploy:rinkeby  // eth testnet
yarn run deploy:mumbai   // polygon testnet
yarn run deploy:prod     // polygon mainnet
```

# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample
contract, a test for that contract, a sample script that deploys that contract,
and an example of a task implementation, which simply lists the available
accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```
# Configuration Variables

First import `vars` from `hardhat/config` in a file such as `hardhat.config.ts`. Replace the data that you wish to hide away with `vars.get("<CUSTOM_VARIABLE>"")`

Run `npx hardhat vars setup` to identify all the variables that are used by your project, this command will provide further instructions on what to do next.

Use `npx hardhat vars set` for each variable as indicated by the setup task.

Use `npx hardhat vars get` to get the value for a variable. This information is retrieved from a file on your disk.