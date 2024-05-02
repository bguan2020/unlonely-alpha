import { usePublicClient } from "wagmi";
import { Contract, VersusTokenDataType } from "../../../../constants";
import { useCallback } from "react";
import { getContractFromNetwork } from "../../../../utils/contract";
import { useNetworkContext } from "../../../context/useNetwork";

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
      handleOwnerMustPermamint: (value: boolean) => void;
    }) => {
      let _winningToken: VersusTokenDataType | null = null;
      let _losingToken: VersusTokenDataType | null = null;
      if (!tokenA.isAlwaysTradeable && !tokenB.isAlwaysTradeable) {
        /**
         * if neither token is always tradeable, the token with the highest total supply wins,
         * but only if the greater highest total supply of the two is greater than zero, because
         * there is no winner between two non-tradeable tokens that have zero total supply
         *
         * in the case of a tie, tokenA is the default winner
         */
        if (
          tokenA.totalSupply >= tokenB.totalSupply &&
          tokenA.totalSupply > BigInt(0)
        ) {
          handleWinningToken(tokenA);
          handleLosingToken(tokenB);
          _winningToken = tokenA;
          _losingToken = tokenB;
        }
        if (
          tokenB.totalSupply > tokenA.totalSupply &&
          tokenB.totalSupply > BigInt(0)
        ) {
          handleWinningToken(tokenB);
          handleLosingToken(tokenA);
          _winningToken = tokenB;
          _losingToken = tokenA;
        }

        if (_winningToken !== null && _losingToken !== null) {
          /**
           * as long as we have a non-tradeable winning and non-tradeable losing token post game, the owner must call the 
           * setWinningTokenTradeableAndTransferLiquidity to make the winning token tradeable, even if the losing token 
           * does not have liquidity
           */
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
          handleWinningToken(tokenA);
          handleLosingToken(tokenB);
          _winningToken = tokenA;
          _losingToken = tokenB;
        } else {
          handleWinningToken(tokenB);
          handleLosingToken(tokenA);
          _winningToken = tokenB;
          _losingToken = tokenA;
        }

        /**
         * double check losing balance because according to our factory smart contract, a token can be set tradeable wthough a separate function,
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
         * is now permanently tradeable and the losing token balance is 0, now we need to confirm whether
         * the factory had already minted the winner tokens by checking its balance of the winner tokens,
         * if it does not have any balance, the owner must permamint the winning token, else the owner can skip this step
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
          return
        }

        handleOwnerMustMakeWinningTokenTradeable(false);
        handleOwnerMustPermamint(true);
      }
    },
    []
  );

  return transitionGameState;
};
