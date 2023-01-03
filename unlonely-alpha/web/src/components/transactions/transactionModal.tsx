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

import { BRIAN_TOKEN_ADDRESS, ETHEREUM_MAINNET_CHAIN_ID } from "../../constants";
import BrianToken from "../../utils/newsToken.json";
import { CustomToast } from "../general/CustomToast";
import { useUser } from "../../hooks/useUser";

type Props = {
  onSuccess: (hash: string) => void;
  price: number;
  title: string;
};

export default function TransactionModal({ onSuccess, price, title }: Props) {
  const { user } = useUser();
  const { addToast } = CustomToast();
  const [open, setOpen] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [allowanceState, setAllowanceState] = useState<Number>(0);
  const accountData = useAccount();

  const {
    data: data3,
    error: error3,
    isLoading: loading3,
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
  } = useContractRead({
    addressOrName: BRIAN_TOKEN_ADDRESS,
    contractInterface: BrianToken,
    functionName: "allowance",
    args: [accountData?.address, BRIAN_TOKEN_ADDRESS],
    chainId: ETHEREUM_MAINNET_CHAIN_ID,
    onSuccess: (data) => {
      setAllowanceState(Number(ethers.utils.formatEther(data)));
      console.log("allowanceState on Success", allowanceState);
    },
  });

  // step 1: approval
  const { config: approvalConfig } = usePrepareContractWrite({
    addressOrName: BRIAN_TOKEN_ADDRESS,
    contractInterface: BrianToken,
    functionName: "approve",
    args: [BRIAN_TOKEN_ADDRESS, price*20000],
    enabled: Boolean(price),
    onError: (err) => {
      setStep(0);
    },
  });

  const { data: approvalData, error: approvalError, writeAsync: writeApproval } = useContractWrite(approvalConfig);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: approvalData?.hash,
    onError: (err) => {
      setStep(0);
    },
    onSuccess: () => {
      const newAllowance = (allowanceState as number)+(price*20);
      setAllowanceState(newAllowance);
      console.log("new allowance", newAllowance);
    },
  });

  // step 2: transfer
  const { config: transferConfig } = usePrepareContractWrite({
    addressOrName: BRIAN_TOKEN_ADDRESS,
    contractInterface: BrianToken,
    functionName: "transfer",
    args: [BRIAN_TOKEN_ADDRESS, price],
    enabled: Boolean(price),
    onError: (err) => {
      setStep(0);
    },
  });

  const { data: transferData, writeAsync: transferWrite, error: transferRejectedError } =
    useContractWrite(transferConfig);
  
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
  }, [isSuccess, transferRejectedError]);


  useEffect(() => {
    console.log("isTransferSuccess", isTransferSuccess);
    if (isTransferSuccess) {
      setOpen(false);
      setStep(0);
      onSuccess && onSuccess(transferData?.hash as string);
    }
  }, [isTransferSuccess]);

  useEffect(() => {
    console.log("allowance", allowance);
    console.log("allowanceLoading", allowanceLoading);
    console.log("allowanceError", allowanceError);
  }, [allowanceLoading, allowance, allowanceError]);

  const handleTransaction = async (price: number) => {
    try {
      if (allowanceState >= price) {
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
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                Current $BRIAN balance:{" "} {data3 ? Math.round(Number(ethers.utils.formatEther(data3))) : "0"}
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
                        price,
                      );
                    } catch (e) {
                      setStep(0);
                    }
                  }}
                  disabled={
                    step === 1 || (data3 && parseInt(data3.toString()) < price)
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
