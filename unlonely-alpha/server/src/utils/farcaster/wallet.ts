import { Wallet } from "ethers";

declare var process: {
  env: {
    FARCASTER_MNEMONIC: string;
  };
};

export default Wallet.fromMnemonic(
  "dice exit onion number drama liberty club tennis speed method walk bright"
);
