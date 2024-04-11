import { useCallback, useMemo, useState, useEffect } from "react";
import {
  Button,
  FormControl,
  Input,
  FormErrorMessage,
  Text,
  Flex,
  Box,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import * as OP from "@eth-optimism/sdk";
import { ethers } from "ethers";
import { usePrivyWagmi } from "@privy-io/wagmi-connector";
import Link from "next/link";

import AppLayout from "../components/layout/AppLayout";
import { useUser } from "../hooks/context/useUser";
import usePostBaseLeaderboard from "../hooks/server/usePostBaseLeaderboard";
import BaseLeaderboard from "../components/leaderboards/BaseLeaderboard";

enum TxStatus {
  Pending,
  Confirmed,
}

const STARTING_CHAIN_ID = "1";

const L1_EXPLORER_URL = "https://etherscan.io/";
const L2_EXPLORER_URL = "https://basescan.org";
const TARGET_RPC_URL = "https://mainnet.base.org";

const BridgePage = () => {
  const { register, handleSubmit, formState } = useForm({
    defaultValues: { amount: "0.01" }, // you can set a default value here
  });
  const { wallet } = usePrivyWagmi();
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

  const [l1Signer, setL1Signer] = useState<ethers.Signer | undefined>(
    undefined
  );
  const [matchingChain, setMatchingChain] = useState<boolean>(true);
  const toast = useToast();
  const [count, setCount] = useState<number>(0);

  const messenger = useMemo(() => {
    if (!user || !l1Signer) return;
    const l2Provider = new ethers.providers.JsonRpcProvider(
      TARGET_RPC_URL
    ).getSigner(user.address);

    return new OP.CrossChainMessenger({
      l1ChainId: OP.L1ChainID.MAINNET,
      l2ChainId: OP.L2ChainID.BASE_MAINNET,
      l1SignerOrProvider: l1Signer,
      l2SignerOrProvider: l2Provider,
    });
  }, [user, l1Signer]);

  // adapted from https://github.com/ethereum-optimism/optimism-tutorial/tree/main/cross-dom-bridge-eth
  const bridge = useCallback(
    async (data: { amount: string }) => {
      const amountToDeposit = ethers.utils.parseEther(data.amount); // parse the amount to wei

      try {
        setBridgeInProgress(true);
        if (!messenger) return;
        const response = await messenger.depositETH(amountToDeposit);
        setL1TxHash(response.hash);
        setL1TxStatus(TxStatus.Pending);
        toast({
          duration: 9000,
          isClosable: true,
          position: "top-right",
          render: () => (
            <Box as="button" borderRadius="md" bg="#287ab0" px={4} h={8}>
              <Link
                target="_blank"
                href={`${L1_EXPLORER_URL}tx/${response.hash}`}
                passHref
              >
                bridge pending, click to view
              </Link>
            </Box>
          ),
        });
        const res = await response.wait();
        if (res.status === 1) {
          setL1TxStatus(TxStatus.Confirmed);
          toast({
            duration: 9000,
            isClosable: true,
            position: "top-right",
            render: () => (
              <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
                <Link
                  target="_blank"
                  href={`${L1_EXPLORER_URL}tx/${response.hash}`}
                  passHref
                >
                  bridge success, click to view
                </Link>
              </Box>
            ),
          });
          await postBaseLeaderboard({
            amount: data.amount,
            userAddress: user?.address,
          });
          setCount((prev) => prev + 1);
        } else {
          setL1TxStatus(null);
          toast({
            duration: 9000,
            isClosable: true,
            position: "top-right",
            render: () => (
              <Box as="button" borderRadius="md" bg="#FF0000" px={4} h={8}>
                <Link
                  target="_blank"
                  href={`${L1_EXPLORER_URL}tx/${response.hash}`}
                  passHref
                >
                  bridge failed, click to view
                </Link>
              </Box>
            ),
          });
        }
        setBridgeInProgress(false);
      } catch (e) {
        setBridgeInProgress(false);
        console.error(e);
      }
    },
    [messenger]
  );

  useEffect(() => {
    const getSigner = async () => {
      if (!wallet) return undefined;
      const p = await wallet.getEthersProvider();
      const l1Signer = p.getSigner();
      setL1Signer(l1Signer);
    };
    getSigner();
  }, [wallet]);

  useEffect(() => {
    const chain = wallet?.chainId;
    setMatchingChain(chain?.split(":")[1] === STARTING_CHAIN_ID);
  }, [wallet]);

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
          <Flex margin="auto" justifyContent="center" mt="2rem">
            <Flex
              width="100%"
              justifyContent="center"
              direction="column"
              gap="25px"
            >
              <form onSubmit={handleSubmit(bridge)}>
                <FormControl isInvalid={!!formState.errors.amount}>
                  <Flex
                    direction={"column"}
                    gap="15px"
                    bg="rgba(0, 0, 0, 0.6)"
                    p="20px"
                    borderRadius="10px"
                  >
                    {!matchingChain && (
                      <Flex justifyContent={"center"}>
                        <Text
                          textAlign={"center"}
                          color="#ff9142"
                          width="325px"
                        >
                          This is a bridge from Ethereum mainnet to Base
                          mainnet, please switch to Ethereum mainnet first.
                        </Text>
                      </Flex>
                    )}
                    <Input
                      id="amount"
                      placeholder="Enter ETH amount"
                      {...register("amount", {
                        required: "Amount is required",
                        pattern: {
                          value: /^\d*(\.\d+)?$/,
                          message:
                            "Invalid amount, please enter a valid number",
                        },
                      })}
                      textAlign="center"
                      padding="30px"
                      fontSize="25px"
                      _hover={{}}
                      _focus={{}}
                      _active={{}}
                    />
                    {bridgeInProgress ? (
                      <>
                        <Flex justifyContent={"center"}>
                          <Spinner size="xl" />
                        </Flex>
                        <Flex justifyContent={"center"}>
                          <Text textAlign={"center"}>
                            Working, give me a few seconds
                          </Text>
                        </Flex>
                      </>
                    ) : (
                      <Button
                        color="white"
                        isDisabled={!matchingChain}
                        type="submit"
                        _hover={{
                          bg: "#13b14f",
                        }}
                        _focus={{}}
                        _active={{}}
                        bg={"#21914c"}
                        py="10px"
                      >
                        <Text fontSize="25px">Bridge ETH</Text>
                      </Button>
                    )}
                    {l1TxStatus === TxStatus.Confirmed && (
                      <>
                        <Text
                          textAlign="center"
                          fontSize={"20px"}
                          color="#05ca50"
                          fontWeight={"bold"}
                        >
                          Transaction Successful!
                        </Text>
                        <Text
                          textAlign="center"
                          fontSize={"14px"}
                          width="400px"
                        >
                          Keep an eye out for your ETH in the other chain - It
                          will take a few minutes for it to arrive in your
                          wallet.
                        </Text>
                        <Flex justifyContent={"center"}>
                          <Link
                            style={{
                              textDecoration: "underline",
                              color: "#09dee5",
                            }}
                            target="_blank"
                            href={`${L2_EXPLORER_URL}/address/${user?.address}#internaltx`}
                            passHref
                          >
                            track here
                          </Link>
                        </Flex>
                        <Text
                          textAlign="center"
                          fontSize={"14px"}
                          width="400px"
                        >
                          You’re ready to start using all paid features once
                          that hits your wallet, so head back to the stream now!
                        </Text>
                      </>
                    )}
                  </Flex>
                  <FormErrorMessage>
                    {formState.errors.amount?.message}
                  </FormErrorMessage>
                </FormControl>
              </form>
              <BaseLeaderboard count={count} />
            </Flex>
          </Flex>
        </Flex>
      </AppLayout>
    </>
  );
};

export default BridgePage;
