import { providers } from "ethers";

export const getEnsName = async (address: string) => {
  const provider = new providers.AlchemyProvider(
    "homestead",
    process.env.ALCHEMY_ETHEREUM_MAINNET_API_KEY
  );
  const ensName = await provider.lookupAddress(address);

  return ensName;
};
