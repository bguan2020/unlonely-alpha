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
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { ethers } from "ethers";

import {
  BRIAN_TOKEN_ADDRESS,
  ETHEREUM_MAINNET_CHAIN_ID,
  BRIAN_TOKEN_APPROVAL_PRICE,
  BRIAN_TOKEN_STREAM_INTERACTION_PRICE,
} from "../../constants";
import BrianToken from "../../utils/newsToken.json";
import { CustomToast } from "../general/CustomToast";
import { useUser } from "../../hooks/useUser";

type Props = {
  onSuccess: (hash: string) => void;
  title: string;
};

export default function TransactionModal({ onSuccess, title }: Props) {
  const { user } = useUser();
  const [error, setError] = useState(null as any);
  const { addToast } = CustomToast();
  const [open, setOpen] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const accountData = useAccount();

  const {
    data: balanceOfData,
    error: balanceOfError,
    isLoading: balanceOfLoading,
  } = useContractRead({
    addressOrName: BRIAN_TOKEN_ADDRESS,
    contractInterface: BrianToken,
    functionName: "balanceOf",
    args: [accountData?.address],
    chainId: ETHEREUM_MAINNET_CHAIN_ID,
  });

  const {
    data: allowance,
    error: allowanceError,
    isLoading: allowanceLoading,
    refetch: refetchAllowance,
  } = useContractRead({
    addressOrName: BRIAN_TOKEN_ADDRESS,
    contractInterface: BrianToken,
    functionName: "allowance",
    args: [accountData?.address, BRIAN_TOKEN_ADDRESS],
    chainId: ETHEREUM_MAINNET_CHAIN_ID,
  });

  // step 1: approval
  const { config: approvalConfig } = usePrepareContractWrite({
    addressOrName: BRIAN_TOKEN_ADDRESS,
    contractInterface: BrianToken,
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

  const { isLoading, isSuccess, error: approvalRejectError } = useWaitForTransaction({
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
    addressOrName: BRIAN_TOKEN_ADDRESS,
    contractInterface: BrianToken,
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
      if (approvalRejectError && approvalRejectError.message.includes("user rejected transaction")) {
        setError("Approval transaction rejected, please try again.");
        return;
      }
      setError(
        "There was an error completing the approval transaction, please try again."
      );
      setStep(0);
    }
  }, [isSuccess, approvalError,approvalRejectError]);

  useEffect(() => {
    if (isTransferSuccess) {
      setOpen(false);
      setStep(0);
      onSuccess && onSuccess(transferData?.hash as string);
    }
    if (transferRejectedError || transferError) {
      if (transferRejectedError && transferRejectedError.message.includes("user rejected transaction")) {
        setError("Transfer transaction rejected, please try again.");
        return;
      }
      setError(
        "There was an error completing the transfer transaction, please try again."
      );
      setStep(0);
    }
  }, [isTransferSuccess, transferRejectedError,transferError]);

  const handleTransaction = async (price: string) => {
    try {
      if (allowance && allowance._hex >= parseInt(price)) {
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
        }}
      >
        <ModalOverlay />
        <ModalContent>
          {!isLoading && !transferLoading ? (
            <>
              <ModalHeader>
                {step === 1 ? "Please accept transfer transaction" : title}
                {error && (
                  <Text fontSize="sm" color="red">
                    {error}
                  </Text>
                )}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>
                  Current $BRIAN balance:{" "}
                  {balanceOfData
                    ? Math.round(
                        Number(ethers.utils.formatEther(balanceOfData))
                      )
                    : "0"}
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
                      await handleTransaction(BRIAN_TOKEN_STREAM_INTERACTION_PRICE);
                    } catch (e) {
                      setStep(0);
                    }
                  }}
                  disabled={
                    step === 1 ||
                    (balanceOfData &&
                      balanceOfData._hex < parseInt(BRIAN_TOKEN_STREAM_INTERACTION_PRICE))
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
