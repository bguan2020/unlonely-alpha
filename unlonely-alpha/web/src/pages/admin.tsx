import {
  Button,
  Flex,
  Input,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { formatUnits, isAddress, parseUnits } from "viem";
import { erc20ABI, useNetwork } from "wagmi";
import AppLayout from "../components/layout/AppLayout";
import { NULL_ADDRESS } from "../constants";
import { NETWORKS } from "../constants/networks";
import {
  useAddCreatorToken,
  useAdmins,
  useBuyCreatorToken,
  useCalculateEthAmount,
  useReadPublic,
  useSetTokenPrice,
  useUseFeature,
} from "../hooks/contracts/useArcadeContract";
import { useApproval } from "../hooks/useApproval";
import useCreateCreatorToken from "../hooks/arcade/useCreateCreatorToken";
import { useUser } from "../hooks/useUser";
import { getContractFromNetwork } from "../utils/contract";
import {
  filteredInput,
  formatIncompleteNumber,
} from "../utils/validation/input";
import useUpdateCreatorTokenPrice from "../hooks/arcade/useUpdateTokenPrice";
import useUpdateUserCreatorTokenQuantity from "../hooks/arcade/useUpdateTokenQuantity";

const inputStyle = {
  borderWidth: "1px",
  borderRadius: "10px",
  borderColor: "#244FA7",
  bg: "rgba(36, 79, 167, 0.05)",
  variant: "unstyled",
  px: "16px",
  py: "10px",
};

export default function AdminPage() {
  const { user } = useUser();
  const { admins } = useAdmins();

  const isAdmin = useMemo(() => {
    if (admins !== undefined && user?.address) {
      const userAddress = user.address;
      return admins.some((admin) => userAddress === admin);
    }
    return false;
  }, [user, admins]);

  return (
    <AppLayout isCustomHeader={false}>
      {/* {isAdmin && <AdminContent />}
      {!isAdmin && <Text>You're not supposed to be here.</Text>} */}
      <AdminContent />
    </AppLayout>
  );
}

const AdminContent = () => {
  const toast = useToast();
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return (
      NETWORKS.find((n) => n.config.chainId === network.chain?.id) ??
      NETWORKS[1]
    );
  }, [network]);
  const contract = getContractFromNetwork("unlonelyArcade", localNetwork);

  const [creatorTokenAddress, setCreatorTokenAddress] = useState<string>("");
  const [creatorTokenSymbol, setCreatorTokenSymbol] = useState<string>("");
  const [creatorTokenName, setCreatorTokenName] = useState<string>("");
  const [channelId, setChannelId] = useState<string>("");
  const [newCreatorTokenAddress, setNewCreatorTokenAddress] =
    useState<string>("");
  const [tokenOwnerAddress, setTokenOwnerAddress] = useState<string>("");

  const [buyTokenAmount, setBuyTokenAmount] = useState<string>("");
  const [featurePrice, setFeaturePrice] = useState<string>("");
  const [initialPrice, setInitialPrice] = useState<string>("");
  const [tokenPriceState, setTokenPriceState] = useState<string>("");

  const buyTokenAmount_bigint = useMemo(
    () => parseUnits(formatIncompleteNumber(buyTokenAmount) as `${number}`, 18),
    [buyTokenAmount]
  );

  const {
    refetch: refetchPublic,
    creatorToken,
    tokenPrice,
    tokenOwner,
  } = useReadPublic(creatorTokenAddress as `0x${string}`);

  const { amountIn } = useCalculateEthAmount(
    creatorTokenAddress as `0x${string}`,
    buyTokenAmount_bigint
  );

  const {
    requiresApproval,
    writeApproval,
    isTxLoading: isApprovalLoading,
    refetchAllowance,
  } = useApproval(
    creatorTokenAddress as `0x${string}`,
    erc20ABI,
    tokenOwner as `0x${string}`,
    contract?.address as `0x${string}`,
    contract?.chainId as number,
    buyTokenAmount_bigint,
    undefined,
    {
      onTxSuccess: (data) => {
        toast({
          title: "approve",
          description: "success",
          status: "success",
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        refetchPublic();
      },
    }
  );

  const {
    addCreatorToken,
    addCreatorTokenData,
    addCreatorTokenTxData,
    addCreatorTokenTxLoading,
  } = useAddCreatorToken(
    {
      creatorTokenAddress: newCreatorTokenAddress as `0x${string}`,
      initialPrice: parseUnits(
        formatIncompleteNumber(initialPrice) as `${number}`,
        18
      ),
      tokenOwner: tokenOwnerAddress as `0x${string}`,
    },
    {
      onTxSuccess: (data) => {
        toast({
          title: "addCreatorToken",
          description: "success",
          status: "success",
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        refetchPublic();
      },
    }
  );

  const { createCreatorToken } = useCreateCreatorToken({
    onError: (error: any) => {
      // console.log(error);
    },
  });

  const handleCreateCreatorToken = async () => {
    if (!addCreatorToken) return;
    // first call smart contract
    await addCreatorToken();
    // then call our database
    // await createCreatorToken({
    //   address: newCreatorTokenAddress as `0x${string}`,
    //   symbol: creatorTokenSymbol,
    //   name: creatorTokenName,
    //   price: Number(initialPrice),
    //   channelId: channelId,
    // });
  };

  const { useFeature, useFeatureData, useFeatureTxData, useFeatureTxLoading } =
    useUseFeature(
      {
        creatorTokenAddress: creatorTokenAddress as `0x${string}`,
        featurePrice: parseUnits(
          formatIncompleteNumber(featurePrice) as `${number}`,
          18
        ),
      },
      {
        onTxSuccess: (data) => {
          toast({
            title: "useFeature",
            description: "success",
            status: "success",
            duration: 9000,
            isClosable: true,
            position: "top-right",
          });
          refetchPublic();
        },
      }
    );

  const {
    buyCreatorToken,
    buyCreatorTokenData,
    buyCreatorTokenTxData,
    buyCreatorTokenTxLoading,
  } = useBuyCreatorToken(
    {
      creatorTokenAddress: creatorTokenAddress as `0x${string}`,
      amountIn,
      amountOut: buyTokenAmount_bigint,
    },
    {
      onTxSuccess: (data) => {
        toast({
          title: "buyCreatorToken",
          description: "success",
          status: "success",
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        refetchPublic();
      },
    }
  );

  const { updateUserCreatorTokenQuantity } = useUpdateUserCreatorTokenQuantity({
    onError: (error: any) => {
      // console.log(error);
    },
  });

  const handleBuyCreatorToken = async () => {
    if (!buyCreatorToken) return;
    // first call smart contract
    await buyCreatorToken();
    // then call our database
    await updateUserCreatorTokenQuantity({
      tokenAddress: creatorTokenAddress as `0x${string}`,
      purchasedAmount: Number(buyTokenAmount),
    });
  };

  const {
    setTokenPrice,
    setTokenPriceData,
    setTokenPriceTxData,
    setTokenPriceTxLoading,
  } = useSetTokenPrice(
    {
      creatorTokenAddress: creatorTokenAddress as `0x${string}`,
      price: parseUnits(
        formatIncompleteNumber(tokenPriceState) as `${number}`,
        18
      ),
    },
    {
      onTxSuccess: (data) => {
        toast({
          title: "setTokenPrice",
          description: "success",
          status: "success",
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        refetchPublic();
      },
    }
  );

  const { updateCreatorTokenPrice } = useUpdateCreatorTokenPrice({
    onError: (error: any) => {
      // console.log(error);
    },
  });

  const handleSetTokenPrice = async () => {
    if (!setTokenPrice) return;
    // first call smart contract
    await setTokenPrice();
    // then call our database
    await updateCreatorTokenPrice({
      tokenAddress: creatorTokenAddress as `0x${string}`,
      price: Number(tokenPriceState),
    });
  };

  const acceptableNewPrice = useMemo(() => {
    const newPrice = parseUnits(
      formatIncompleteNumber(tokenPriceState) as `${number}`,
      18
    );
    if (!tokenPrice && newPrice >= BigInt(0)) return true;
    return newPrice !== tokenPrice && newPrice >= BigInt(0);
  }, [tokenPrice, tokenPriceState]);

  const handleInputChange = (event: any, callback: (str: string) => void) => {
    const input = event.target.value;
    const filtered = filteredInput(input);
    callback(filtered);
  };

  useEffect(() => {
    if (creatorTokenAddress) refetchAllowance();
  }, [buyCreatorTokenTxLoading, isApprovalLoading]);

  return (
    <Flex direction="column" p="10px" gap="20px">
      <Flex>{localNetwork.config.name}</Flex>
      <Text fontSize="25px" fontFamily="Neue Pixel Sans">
        addCreatorToken
      </Text>
      <Flex gap={"10px"} alignItems="flex-end">
        <VStack>
          <Text>new creator token address</Text>
          <Input
            {...inputStyle}
            width="300px"
            isInvalid={!isAddress(newCreatorTokenAddress)}
            value={newCreatorTokenAddress}
            onChange={(e) => setNewCreatorTokenAddress(e.target.value)}
          />
        </VStack>
        <VStack>
          <Text>symbol</Text>
          <Input
            {...inputStyle}
            width="96px"
            value={creatorTokenSymbol}
            onChange={(e) => setCreatorTokenSymbol(e.target.value)}
          />
        </VStack>
        <VStack>
          <Text>name</Text>
          <Input
            {...inputStyle}
            width="128px"
            value={creatorTokenName}
            onChange={(e) => setCreatorTokenName(e.target.value)}
          />
        </VStack>
        <VStack>
          <Text>channelId</Text>
          <Input
            {...inputStyle}
            width="64px"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
          />
        </VStack>
        <VStack>
          <Text>how much eth will this new token cost?</Text>
          <Input
            width="128px"
            {...inputStyle}
            value={initialPrice}
            onChange={(e) => handleInputChange(e, setInitialPrice)}
          />
        </VStack>
        <VStack>
          <Text>what is the address of the token owner?</Text>
          <Input
            width="400px"
            {...inputStyle}
            value={tokenOwnerAddress}
            onChange={(e) => setTokenOwnerAddress(e.target.value)}
          />
        </VStack>
        {addCreatorTokenTxLoading ? (
          <Spinner />
        ) : (
          <Button
            bg="#131323"
            _hover={{}}
            _focus={{}}
            _active={{}}
            onClick={handleCreateCreatorToken}
            isDisabled={!addCreatorToken}
          >
            Send
          </Button>
        )}
      </Flex>
      <Text fontSize="25px" fontFamily="Neue Pixel Sans">
        useFeature
      </Text>
      <Flex gap={"10px"} alignItems="flex-end">
        <VStack>
          <Text>existing creator token address</Text>
          <Input
            {...inputStyle}
            width="400px"
            isInvalid={!isAddress(creatorTokenAddress)}
            value={creatorTokenAddress}
            onChange={(e) => setCreatorTokenAddress(e.target.value)}
          />
        </VStack>
        <VStack>
          <Text>owner</Text>
          <Input
            {...inputStyle}
            width="300px"
            isReadOnly
            value={tokenOwner !== NULL_ADDRESS ? tokenOwner : ""}
          />
        </VStack>
        <VStack>
          <Text>how much of this token does this feature cost?</Text>
          <Input
            {...inputStyle}
            width="250px"
            value={featurePrice}
            onChange={(e) => handleInputChange(e, setFeaturePrice)}
          />
        </VStack>
        {useFeatureTxLoading ? (
          <Spinner />
        ) : (
          <Button
            bg="#131323"
            _hover={{}}
            _focus={{}}
            _active={{}}
            onClick={useFeature}
            isDisabled={!isAddress(creatorTokenAddress) || !useFeature}
          >
            Send
          </Button>
        )}
      </Flex>
      <Text fontSize="25px" fontFamily="Neue Pixel Sans">
        buyCreatorToken
      </Text>
      <Flex gap={"10px"} alignItems="flex-end">
        <VStack>
          <Text>existing creator token address</Text>
          <Input
            width="400px"
            {...inputStyle}
            isInvalid={!isAddress(creatorTokenAddress)}
            value={creatorTokenAddress}
            onChange={(e) => setCreatorTokenAddress(e.target.value)}
          />
        </VStack>
        <VStack>
          <Text>owner</Text>
          <Input
            {...inputStyle}
            width="300px"
            isReadOnly
            value={tokenOwner !== NULL_ADDRESS ? tokenOwner : ""}
          />
        </VStack>
        <VStack>
          <Text>how much of this creator token do you want to buy?</Text>
          <Input
            width="500px"
            {...inputStyle}
            value={buyTokenAmount}
            onChange={(e) => handleInputChange(e, setBuyTokenAmount)}
          />
        </VStack>
        <VStack>
          <Text>{tokenPrice ? "price found" : "price not found"}</Text>
          <Input
            width="200px"
            {...inputStyle}
            isReadOnly
            value={
              tokenPrice
                ? `${formatUnits(tokenPrice ?? BigInt(0), 18)} ETH`
                : ""
            }
          />
        </VStack>
        {buyCreatorTokenTxLoading ? (
          <Spinner />
        ) : (
          <Button
            bg="#131323"
            _hover={{}}
            _focus={{}}
            _active={{}}
            onClick={handleBuyCreatorToken}
            isDisabled={!isAddress(creatorTokenAddress) || !buyCreatorToken}
          >
            Send
          </Button>
        )}
      </Flex>
      <Text fontSize="25px" fontFamily="Neue Pixel Sans">
        setTokenPrice
      </Text>
      <Flex gap={"10px"} alignItems="flex-end">
        <VStack>
          <Text>existing creator token address</Text>
          <Input
            {...inputStyle}
            width="400px"
            isInvalid={!isAddress(creatorTokenAddress)}
            value={creatorTokenAddress}
            onChange={(e) => setCreatorTokenAddress(e.target.value)}
          />
        </VStack>
        <VStack>
          <Text>owner</Text>
          <Input
            {...inputStyle}
            width="300px"
            isReadOnly
            value={tokenOwner !== NULL_ADDRESS ? tokenOwner : ""}
          />
        </VStack>
        <VStack>
          <Text>how much ETH will this token cost?</Text>
          <Input
            {...inputStyle}
            width="500px"
            value={tokenPriceState}
            onChange={(e) => handleInputChange(e, setTokenPriceState)}
          />
        </VStack>
        <VStack>
          <Text>{tokenPrice ? "price found" : "price not found"}</Text>
          <Input
            width="200px"
            {...inputStyle}
            isReadOnly
            value={
              tokenPrice
                ? `${formatUnits(tokenPrice ?? BigInt(0), 18)} ETH`
                : ""
            }
          />
        </VStack>
        {setTokenPriceTxLoading ? (
          <Spinner />
        ) : (
          <Button
            bg="#131323"
            _hover={{}}
            _focus={{}}
            _active={{}}
            onClick={handleSetTokenPrice}
            isDisabled={
              !isAddress(creatorTokenAddress) ||
              !setTokenPrice ||
              !acceptableNewPrice
            }
          >
            Send
          </Button>
        )}
      </Flex>
      <Text fontSize="25px" fontFamily="Neue Pixel Sans">
        approve (owners only)
      </Text>
      <Flex gap={"10px"} alignItems="flex-end">
        <VStack>
          <Text>existing creator token address</Text>
          <Input
            {...inputStyle}
            width="400px"
            isInvalid={!isAddress(creatorTokenAddress)}
            value={creatorTokenAddress}
            onChange={(e) => setCreatorTokenAddress(e.target.value)}
          />
        </VStack>
        <VStack>
          <Text>owner</Text>
          <Input
            {...inputStyle}
            width="300px"
            isReadOnly
            value={tokenOwner !== NULL_ADDRESS ? tokenOwner : ""}
          />
        </VStack>
        <VStack>
          <Text>
            {"(owners only) how much of this token should go on sale?"}
          </Text>
          <Input
            {...inputStyle}
            width="500px"
            value={buyTokenAmount}
            onChange={(e) => handleInputChange(e, setBuyTokenAmount)}
          />
        </VStack>
        <VStack>
          <Text>needs approval?</Text>
          <Input
            width="200px"
            {...inputStyle}
            isReadOnly
            value={requiresApproval ? "yes" : "no"}
            bg={requiresApproval ? "red" : "inherit"}
          />
        </VStack>
        {isApprovalLoading ? (
          <Spinner />
        ) : (
          <Button
            bg="#131323"
            _hover={{}}
            _focus={{}}
            _active={{}}
            onClick={writeApproval}
            isDisabled={!isAddress(creatorTokenAddress) || !writeApproval}
          >
            Send
          </Button>
        )}
      </Flex>
    </Flex>
  );
};
