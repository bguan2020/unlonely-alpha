import { providers } from "ethers";

export const getEnsName = async (address: string) => {
  // const provider = new providers.AlchemyProvider(
  //   "homestead",
  //   process.env.ALCHEMY_ETHEREUM_MAINNET_API_KEY
  // );
  const provider = new providers.InfuraProvider(
    "homestead",
    "3b2a738fb8834266ba5a7538efe46d7e"
  );
  const ensName = await provider.lookupAddress(address);

  return ensName;
};
