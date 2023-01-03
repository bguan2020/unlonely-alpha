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
import { BRIAN_TOKEN_ADDRESS } from "../../constants";
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
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
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
    chainId: 137,
  });

  const {
    data: allowance,
    error: allowanceError,
    isLoading: allowanceLoading,
  } = useContractRead({
    addressOrName: BRIAN_TOKEN_ADDRESS,
    contractInterface: BrianToken,
    functionName: "allowance",
    args: [accountData?.address],
    chainId: 137,
  });

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
  const { data: transferData, writeAsync: transferWrite } =
    useContractWrite(transferConfig);
  const { config } = usePrepareContractWrite({
    addressOrName: BRIAN_TOKEN_ADDRESS,
    contractInterface: BrianToken,
    functionName: "approve",
    args: [accountData?.address, price],
    enabled: Boolean(price),
    onSuccess: async (data) => {
      try {
        transferWrite && (await transferWrite());
      } catch (e) {
        setStep(0);
      }
    },
    onError: (err) => {
      setStep(0);
    },
  });

  const { data, error, writeAsync } = useContractWrite(config);
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onError: (err) => {
      setStep(0);
    },
  });
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
  }, [isSuccess]);

  useEffect(() => {
    if (isTransferSuccess) {
      setOpen(false);
      setStep(0);
      onSuccess && onSuccess(transferData?.hash as string);
    }
  }, [isTransferSuccess]);
  const handleTransaction = async (price: number, allowance: number) => {
    try {
      if (allowance >= price) {
        setStep(1);
        transferWrite && (await transferWrite());
      } else {
        writeAsync && (await writeAsync());
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
          setStep(0)
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
              <ModalFooter justifyContent="space-between">
                <Button
                  colorScheme="blue"
                  mr={3}
                  onClick={() => {
                    setOpen(false)
                    setStep(0)}}
                >
                  Close
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      await handleTransaction(
                        price,
                        allowance ? parseInt(allowance.toString()) : 0
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
