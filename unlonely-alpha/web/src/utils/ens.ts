import { providers } from "ethers";

export const getEnsName = async (address: string) => {
  // get ens using infuraProvier
  const provider = new providers.InfuraProvider(
    "homestead",
    "3b2a738fb8834266ba5a7538efe46d7e"
  );
  const ensName = await provider.lookupAddress(address);

  return ensName;
};
