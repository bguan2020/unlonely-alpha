import { useCallback, useMemo, useState } from "react";
import {
  Button,
  FormControl,
  Input,
  FormErrorMessage,
  Flex,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import * as OP from "@eth-optimism/sdk";
import { ethers } from "ethers";

import AppLayout from "../components/layout/AppLayout";
import { useUser } from "../hooks/context/useUser";
import usePostBaseLeaderboard from "../hooks/server/usePostBaseLeaderboard";
import BaseLeaderboard from "../components/arcade/BaseLeaderboard";

enum TxStatus {
  Pending,
  Confirmed,
}

const L1_EXPLORER_URL = "https://goerli.etherscan.io/";
const L2_EXPLORER_URL = "https://goerli.basescan.org";

const BridgePage = () => {
  const { register, handleSubmit, formState } = useForm({
    defaultValues: { amount: "0.01" }, // you can set a default value here
  });
  const { postBaseLeaderboard } = usePostBaseLeaderboard({
    onError: (m: any) => {
      console.log(m);
    },
  });
  const { user } = useUser();
  const [l1TxHash, setL1TxHash] = useState<string>("");
  const [l1TxStatus, setL1TxStatus] = useState<TxStatus | null>(null);
  const [l2TxHash, setL2TxHash] = useState<string>("");
  const [l2TxStatus, setL2TxStatus] = useState<TxStatus | null>(null);
  const [l2StartBlockNumber, setL2StartBlockNumber] = useState<number | null>(
    null
  );
  const [messageStatus, setMessageStatus] = useState<OP.MessageStatus | null>(
    null
  );
  const [bridgeInProgress, setBridgeInProgress] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number>(0);

  const messenger = useMemo(() => {
    if (!user) return;
    const l2Provider = new ethers.providers.JsonRpcProvider(
      "https://goerli.base.org"
    ).getSigner(user.address);
    return new OP.CrossChainMessenger({
      l1ChainId: OP.L1ChainID.GOERLI,
      l2ChainId: OP.L2ChainID.BASE_GOERLI,
      l1SignerOrProvider: user.address,
      l2SignerOrProvider: l2Provider,
    });
  }, [user]);

  // adapted from https://github.com/ethereum-optimism/optimism-tutorial/tree/main/cross-dom-bridge-eth
  const bridge = useCallback(
    async (data: { amount: string }) => {
      const amountToDeposit = ethers.utils.parseEther(data.amount); // parse the amount to wei
      postBaseLeaderboard({
        amount: data.amount,
      });
      // try {
      //   setBridgeInProgress(true);
      //   console.log(messenger);
      //   if (!messenger) return;
      //   // bridging 1 wei
      //   const response = await messenger.depositETH(amountToDeposit);
      //   setL1TxHash(response.hash);
      //   setL1TxStatus(TxStatus.Pending);
      //   await response.wait();
      //   setL1TxStatus(TxStatus.Confirmed);
      //   // we will use the L2 block number to optimize
      //   // our L2 calls looking for the bridge transaction
      //   const l2Block = await messenger.l2Provider.getBlockNumber();
      //   const waitTime = await messenger.estimateMessageWaitTimeSeconds(
      //     response.hash,
      //     0, // message index, 0 unless multicall
      //     l2Block,
      //   );
      //   setEstimatedWaitTime(waitTime);
      //   setL2StartBlockNumber(l2Block);
      //   const l2Receipt = await messenger.waitForMessageReceipt(response.hash, {
      //     fromBlockOrBlockHash: l2Block,
      //   });
      //   setL2TxStatus(TxStatus.Confirmed);
      //   setL2TxHash(l2Receipt.transactionReceipt.transactionHash);
      //   setBridgeInProgress(false);
      // } catch (e) {
      //   setBridgeInProgress(false);
      //   console.error(e);
      // }
    },
    [messenger]
  );

  return (
    <>
      <AppLayout isCustomHeader={false}>
        <Flex
          justifyContent="center"
          mt="5rem"
          direction="column"
          ml="2rem"
          mr="2rem"
        >
          <Flex width="80%" justifyContent="center" mt="2rem">
            <Flex width="100%" justifyContent="center" direction="column">
              <form onSubmit={handleSubmit(bridge)}>
                <FormControl isInvalid={!!formState.errors.amount}>
                  <Input
                    id="amount"
                    placeholder="Enter amount of ETH"
                    {...register("amount", {
                      required: "Amount is required",
                      pattern: {
                        value: /^\d*(\.\d+)?$/,
                        message: "Invalid amount, please enter a valid number",
                      },
                    })}
                  />
                  <FormErrorMessage>
                    {formState.errors.amount?.message}
                  </FormErrorMessage>
                  <Button
                    disabled={bridgeInProgress}
                    type="submit"
                    className="rounded-lg bg-blue-500 p-2 text-white mt-10"
                  >
                    Bridge
                  </Button>
                </FormControl>
              </form>
              <BaseLeaderboard />
            </Flex>
          </Flex>
        </Flex>
      </AppLayout>
    </>
  );
};

export default BridgePage;
