import {
  Button,
  Modal,
  ModalOverlay,
  Text,
  Center,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  useBalance,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { BigNumberish, ethers } from "ethers";

import {
  BRIAN_TOKEN_ADDRESS,
  ETHEREUM_MAINNET_CHAIN_ID,
  BRIAN_TOKEN_APPROVAL_PRICE,
  BRIAN_TOKEN_STREAM_INTERACTION_PRICE,
  BRIAN_TOKEN_STREAM_INTERACTION_PRICE_DECIMAL,
} from "../../constants";
import BrianToken from "../../utils/newsToken.json";
import { CustomToast } from "../general/CustomToast";
import { useUser } from "../../hooks/context/useUser";
import { ChatBot } from "../../constants/types";
type Props = {
  onSuccess: (hash: string) => void;
  title: string;
  setChatBot: (chatBot: ChatBot[]) => void;
  chatBot: ChatBot[];
};

export default function TransactionModal({
  onSuccess,
  title,
  chatBot,
  setChatBot,
}: Props) {
  const { user } = useUser();
  const [error, setError] = useState(null as any);
  const { addToast } = CustomToast();
  const [open, setOpen] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);

  const {
    data: balanceOfData,
    isError: balanceOfError,
    isLoading: balanceOfLoading,
  } = useBalance({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    address: user?.address,
    token: BRIAN_TOKEN_ADDRESS,
  });

  const {
    data: allowance,
    error: allowanceError,
    isLoading: allowanceLoading,
    refetch: refetchAllowance,
  } = useContractRead({
    address: BRIAN_TOKEN_ADDRESS,
    abi: BrianToken,
    functionName: "allowance",
    args: [user?.address, BRIAN_TOKEN_ADDRESS],
    chainId: ETHEREUM_MAINNET_CHAIN_ID,
  });

  // step 1: approval
  const { config: approvalConfig } = usePrepareContractWrite({
    address: BRIAN_TOKEN_ADDRESS,
    abi: BrianToken,
    functionName: "approve",
    args: [BRIAN_TOKEN_ADDRESS, BRIAN_TOKEN_APPROVAL_PRICE],
    chainId: ETHEREUM_MAINNET_CHAIN_ID,
    onError: (err) => {
      setStep(0);
    },
  });

  const {
    data: approvalData,
    error: approvalError,
    writeAsync: writeApproval,
  } = useContractWrite(approvalConfig);

  const {
    isLoading,
    isSuccess,
    error: approvalRejectError,
  } = useWaitForTransaction({
    hash: approvalData?.hash,
    onError: (err) => {
      setStep(0);
    },
    onSuccess: async () => {
      const data = await refetchAllowance();
    },
  });

  // step 2: transfer
  const { config: transferConfig } = usePrepareContractWrite({
    address: BRIAN_TOKEN_ADDRESS,
    abi: BrianToken,
    functionName: "transfer",
    args: [BRIAN_TOKEN_ADDRESS, BRIAN_TOKEN_STREAM_INTERACTION_PRICE],
    onError: (err) => {
      setStep(0);
    },
  });

  const {
    data: transferData,
    writeAsync: transferWrite,
    error: transferRejectedError,
  } = useContractWrite(transferConfig);

  const {
    isLoading: transferLoading,
    isSuccess: isTransferSuccess,
    error: transferError,
  } = useWaitForTransaction({
    hash: transferData?.hash,
    onError: (err) => {
      setStep(0);
    },
  });

  useEffect(() => {
    if (isSuccess) {
      setStep(1);
      transferWrite && transferWrite();
    }
    if (approvalError || approvalRejectError) {
      if (
        approvalRejectError &&
        approvalRejectError.message.includes("user rejected transaction")
      ) {
        setError("Approval transaction rejected, please try again.");
        setStep(0);
        return;
      }
      setError(
        "There was an error completing the approval transaction, please try again."
      );
      setStep(0);
    }
  }, [isSuccess, approvalError, approvalRejectError]);

  useEffect(() => {
    if (isTransferSuccess) {
      setOpen(false);
      setStep(0);
      onSuccess && onSuccess(transferData?.hash as string);
      if (user) {
        setChatBot([
          ...chatBot,
          {
            username: user.username ? user.username : "anonymous",
            address: user.address,
            title: title,
            taskType: "scene-change",
            description: "",
          },
        ]);
      }
    }
    if (transferRejectedError || transferError) {
      if (
        transferRejectedError &&
        transferRejectedError.message.includes("user rejected transaction")
      ) {
        setError("Transfer transaction rejected, please try again.");
        setStep(0);
        return;
      }
      setError(
        "There was an error completing the transfer transaction, please try again."
      );
      setStep(0);
    }
  }, [isTransferSuccess, transferRejectedError, transferError]);

  const handleTransaction = async (price: string) => {
    setError(null as any);
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (
        allowance &&
        Number(ethers.utils.formatEther(allowance as BigNumberish)) >=
          parseInt(price)
      ) {
        setStep(1);
        transferWrite && (await transferWrite());
      } else {
        writeApproval && (await writeApproval());
      }
    } catch (e) {
      setStep(0);
    }
  };

  const handleOpen = () => {
    !user?.address
      ? addToast({
          title: "Sign in first.",
          description: "Please sign into your wallet first.",
          status: "warning",
        })
      : setOpen(true);
  };

  return (
    <>
      <Center mb={3}>
        <Button onClick={() => handleOpen()}>{title}</Button>
      </Center>
      <Modal
        isCentered={true}
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setStep(0);
          setError(null as any);
        }}
      >
        <ModalOverlay />
        <ModalContent>
          {!isLoading && !transferLoading ? (
            <>
              <ModalCloseButton />
              <ModalHeader>
                {step === 1 ? "Please accept transfer transaction" : title}
                {error && (
                  <Text fontSize="sm" color="red">
                    {error}
                  </Text>
                )}
              </ModalHeader>
              <ModalBody>
                <Text>Price: 5 $BRIAN</Text>
                <Text>
                  Your Current Balance:{" "}
                  {balanceOfData
                    ? Math.round(Number(balanceOfData.formatted))
                    : "0"}{" "}
                  ${balanceOfData && balanceOfData.symbol}
                </Text>
              </ModalBody>
              <ModalFooter justifyContent="space-between">
                <Button
                  colorScheme="blue"
                  mr={3}
                  onClick={() => {
                    setOpen(false);
                    setStep(0);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      await handleTransaction(
                        BRIAN_TOKEN_STREAM_INTERACTION_PRICE
                      );
                    } catch (e) {
                      setStep(0);
                    }
                  }}
                  disabled={
                    step === 1 ||
                    (balanceOfData &&
                      Number(ethers.utils.formatEther(balanceOfData.value)) <
                        parseInt(BRIAN_TOKEN_STREAM_INTERACTION_PRICE_DECIMAL))
                  }
                  colorScheme="green"
                >
                  Make purchase
                </Button>
              </ModalFooter>{" "}
            </>
          ) : (
            <ModalBody
              m="2"
              justifyContent="center"
              justifyItems="center"
              alignItems="center"
            >
              {
                <Text mb={5} align="center">
                  {isLoading
                    ? "Waiting for approval transaction..."
                    : "waiting for transfer..."}
                </Text>
              }
              <Center mb={5}>
                <Spinner />
              </Center>{" "}
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
