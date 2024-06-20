import { usePublicClient } from "wagmi";
import { Contract } from "../../../../constants";
import { useCallback } from "react";
import { getContractFromNetwork } from "../../../../utils/contract";
import { useNetworkContext } from "../../../context/useNetwork";
import { VersusTokenDataType } from "../../../../constants/types/token";

export const useVersusGameStateTransitioner = () => {
  const publicClient = usePublicClient();

  const { network } = useNetworkContext();
  const { localNetwork } = network;

  const factoryContract = getContractFromNetwork(
    Contract.TEMP_TOKEN_FACTORY_V1,
    localNetwork
  );

  const transitionGameState = useCallback(
    async ({
      tokenA,
      tokenB,
      handleWinningToken,
      handleLosingToken,
      handleOwnerMustMakeWinningTokenTradeable,
      handleOwnerMustPermamint,
    }: {
      tokenA: VersusTokenDataType;
      tokenB: VersusTokenDataType;
      handleWinningToken: (token: VersusTokenDataType) => void;
      handleLosingToken: (token: VersusTokenDataType) => void;
      handleOwnerMustMakeWinningTokenTradeable: (value: boolean) => void;
      handleOwnerMustPermamint: (value: boolean | number) => void;
    }) => {
      let _winningToken: VersusTokenDataType | null = null;
      let _losingToken: VersusTokenDataType | null = null;
      if (!tokenA.isAlwaysTradeable && !tokenB.isAlwaysTradeable) {
        /**
         * if neither token is always tradeable, the streamer must decide the winner, but only if at least 1 token has a non-zero supply
         */

        if (tokenA.totalSupply > BigInt(0) || tokenB.totalSupply > BigInt(0)) {
          handleOwnerMustMakeWinningTokenTradeable(true);
          handleOwnerMustPermamint(false);
        } else {
          handleOwnerMustMakeWinningTokenTradeable(false);
          handleOwnerMustPermamint(false);
        }
      } else {
        /**
         * if one token is always tradeable, it wins, regardless of the total supplies
         * and we define _winningToken and _losingToken
         *
         * if both tokens are always tradeable, token A is the default winner
         */

        if (tokenA.isAlwaysTradeable) {
          _winningToken = tokenA;
          _losingToken = tokenB;
        } else {
          _winningToken = tokenB;
          _losingToken = tokenA;
        }

        handleWinningToken(_winningToken);
        handleLosingToken(_losingToken);

        /**
         * double check losing balance because according to our factory smart contract, a token can be set tradeable through a separate function,
         * so if the losing token has a balance, the owner must call the setWinningTokenTradeableAndTransferLiquidity function
         */
        const losingTokenBalance = await publicClient.readContract({
          address: _losingToken.contractData.address as `0x${string}`,
          abi: _losingToken.contractData.abi,
          functionName: "getBalance",
          args: [],
        });
        if (BigInt(String(losingTokenBalance)) > BigInt(0)) {
          handleOwnerMustMakeWinningTokenTradeable(true);
          handleOwnerMustPermamint(false);
          return;
        }

        /**
         * if the losing token no longer has a balance, that should mean the winning token
         * is now permanently tradeable, now we need to confirm whether
         * the factory had already minted the winner tokens by checking its balance of the winner tokens,
         * if it has a balance, it means the permamint was successful,
         * else the user is redirected to the permamint phase
         */
        const winningTokenBalanceForFactory = await publicClient.readContract({
          address: _winningToken.contractData.address as `0x${string}`,
          abi: _winningToken.contractData.abi,
          functionName: "balanceOf",
          args: [factoryContract.address],
        });

        if (BigInt(String(winningTokenBalanceForFactory)) > BigInt(0)) {
          handleOwnerMustMakeWinningTokenTradeable(false);
          handleOwnerMustPermamint(false);
          return;
        }

        handleOwnerMustMakeWinningTokenTradeable(false);
        handleOwnerMustPermamint(true);
      }
    },
    [factoryContract, publicClient]
  );

  return transitionGameState;
};
