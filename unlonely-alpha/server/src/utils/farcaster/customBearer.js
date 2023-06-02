const ethers = require('ethers');
const canonicalize = require('canonicalize');

const EIP_191_PREFIX = "eip191:";

// Given an Ethers Wallet and a JSON payload, generate the custody bearer token
export const generateCustodyBearer = async (payload, wallet) => {
  const signature = await wallet.signMessage(canonicalize(payload));
  const signatureString = Buffer.from(ethers.utils.arrayify(signature)).toString('base64');
  return EIP_191_PREFIX + signatureString;
}

// Given the custody bearer token, JSON payload and wallet address, verify that the bearer token is valid 
export const verifyCustodyBearer = async (custodyBearerToken, payload, address) => {
  const recoveredAddress = ethers.utils.recoverAddress(
    ethers.utils.hashMessage(canonicalize(payload)),
    ethers.utils.hexlify(Buffer.from(custodyBearerToken.split(':')[1], 'base64'))
  );
  return recoveredAddress === address;
}