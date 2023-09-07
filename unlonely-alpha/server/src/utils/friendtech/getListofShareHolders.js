const { Alchemy, Network } = require('alchemy-sdk');

const apiKey = "aR93M6MdEC4lgh4VjPXLaMnfBveve1fC";
const contractAddress = "0xcf205808ed36593aa40a44f10c7f7c2f67d4a4d4";
0x000016118980d11b8eb7d9ec46660747347a3810

// Optional config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey, // Replace with your Alchemy API Key.
  network: Network.BASE_MAINNET, // Replace with your network.
};
const alchemy = new Alchemy(settings);

async function getContractCreationBlock(contractAddress) {
  const deployResult = await alchemy.core.findContractDeployer(contractAddress);
  if (deployResult && deployResult.blockNumber) {
    return deployResult.blockNumber;
  }
  throw new Error("Contract creation block not found");
};

function parseTradeEvent(log) {
  // Split the data into 32-byte chunks
  const dataChunks = log.data.match(/.{1,64}/g).map(chunk => '0x' + chunk);

  // Ensure there are enough data chunks
  if (dataChunks.length < 8) {
    console.error('Unexpected number of data chunks:', dataChunks.length);
    return null;
  }

  // Extract Ethereum addresses from 32-byte chunks
  const extractAddress = (chunk) => '0x' + chunk.slice(24, 64);

  return {
    trader: extractAddress(dataChunks[0]),
    subject: extractAddress(dataChunks[1]),
    isBuy: parseInt(dataChunks[2], 16) !== 0,
    shareAmount: parseInt(dataChunks[3], 16),
    ethAmount: parseInt(dataChunks[4], 16),
    protocolEthAmount: parseInt(dataChunks[5], 16),
    subjectEthAmount: parseInt(dataChunks[6], 16),
    supply: parseInt(dataChunks[7], 16)
  };
}

(async () => {
  const fromBlock = await getContractCreationBlock(contractAddress);

  console.log(fromBlock, "fromBlock");

  const fromBlockHex = '0x' + parseInt(fromBlock).toString(16);
  console.log(fromBlockHex);

// Get logs for a certain address, with specified topics and blockHash
  const logs = await alchemy.core
    .getLogs({
      address: contractAddress,
      fromBlock: fromBlockHex,
      toBlock: "0x257053",
    });
  console.log(logs);

  const parsedLogs = logs.map(parseTradeEvent);
  console.log(parsedLogs);
})();
  
