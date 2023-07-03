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
import { useNetwork } from "wagmi";
import AppLayout from "../components/layout/AppLayout";
import { NULL_ADDRESS } from "../constants";
import { NETWORKS } from "../constants/networks";
import {
  useAddCreatorToken,
  useAdmins,
  useBuyCreatorToken,
  useCalculateEthAmount,
  useReadPublic,
  useSetTokenPrices,
  useUseFeature,
} from "../hooks/contracts/useArcadeContract";
import { useApproval } from "../hooks/contracts/useApproval";
import useCreateCreatorToken from "../hooks/server/arcade/useCreateCreatorToken";
import { useUser } from "../hooks/context/useUser";
import { getContractFromNetwork } from "../utils/contract";
import {
  filteredInput,
  formatIncompleteNumber,
} from "../utils/validation/input";
import useUpdateCreatorTokenPrice from "../hooks/server/arcade/useUpdateTokenPrice";
import useUpdateUserCreatorTokenQuantity from "../hooks/server/arcade/useUpdateTokenQuantity";
import CreatorTokenAbi from "../constants/abi/CreatorToken.json";

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
      {isAdmin && <AdminContent />}
      {!isAdmin && <Text>You're not supposed to be here.</Text>}
      {/* <AdminContent /> */}
    </AppLayout>
  );
}

const AdminContent = () => {
  const toast = useToast();
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return (
      NETWORKS.find((n) => n.config.chainId === network.chain?.id) ??
      NETWORKS[0]
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
  const [newTokenPricesStr, setNewTokenPricesStr] = useState<string>("");
  const [creatorTokenAddressesStr, setCreatorTokenAddressesStr] =
    useState<string>("");

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
    CreatorTokenAbi,
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
    await createCreatorToken({
      address: newCreatorTokenAddress as `0x${string}`,
      symbol: creatorTokenSymbol,
      name: creatorTokenName,
      price: Number(initialPrice),
      channelId: channelId,
    });
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
    setTokenPrices,
    setTokenPricesData,
    setTokenPricesTxData,
    setTokenPricesTxLoading,
  } = useSetTokenPrices(
    {
      creatorTokens: creatorTokenAddressesStr.split(",") as `0x${string}`[],
      newPrices: newTokenPricesStr
        .split(",")
        .map((p) => parseUnits(formatIncompleteNumber(p) as `${number}`, 18)),
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

  const handleSetTokenPrices = async () => {
    if (
      !setTokenPrices ||
      newTokenPricesStr.split(",").length !==
        creatorTokenAddressesStr.split(",").length
    )
      return;
    // first call smart contract
    await setTokenPrices();
    // then call our database
    await Promise.all(
      creatorTokenAddressesStr.split(",").map(async (tokenAddress, index) => {
        await updateCreatorTokenPrice({
          tokenAddress: tokenAddress as `0x${string}`,
          price: Number(newTokenPricesStr.split(",")[index]),
        });
      })
    );
  };

  const handleInputChange = (
    event: any,
    callback: (str: string) => void,
    allowDecimals?: boolean
  ) => {
    const input = event.target.value;
    const filtered = filteredInput(input, allowDecimals);
    callback(filtered);
  };

  useEffect(() => {
    if (creatorTokenAddress) refetchAllowance();
  }, [buyCreatorTokenTxLoading, isApprovalLoading]);

  return (
    <Flex direction="column" p="10px" gap="20px" bg="#636363">
      <Flex>{localNetwork.config.name}</Flex>
      <Text fontSize="25px" fontFamily="Neue Pixel Sans">
        addCreatorToken
      </Text>
      <Flex gap={"10px"} alignItems="flex-end">
        <VStack>
          <Text>new creator token address</Text>
          <Input
            {...inputStyle}
            readOnly={addCreatorTokenTxLoading}
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
            readOnly={addCreatorTokenTxLoading}
            width="96px"
            value={creatorTokenSymbol}
            onChange={(e) => setCreatorTokenSymbol(e.target.value)}
          />
        </VStack>
        <VStack>
          <Text>name</Text>
          <Input
            {...inputStyle}
            readOnly={addCreatorTokenTxLoading}
            width="128px"
            value={creatorTokenName}
            onChange={(e) => setCreatorTokenName(e.target.value)}
          />
        </VStack>
        <VStack>
          <Text>channelId</Text>
          <Input
            {...inputStyle}
            readOnly={addCreatorTokenTxLoading}
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
            readOnly={addCreatorTokenTxLoading}
            value={initialPrice}
            onChange={(e) => handleInputChange(e, setInitialPrice, true)}
          />
        </VStack>
        <VStack>
          <Text>what is the address of the token owner?</Text>
          <Input
            width="400px"
            {...inputStyle}
            readOnly={addCreatorTokenTxLoading}
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
            readOnly={useFeatureTxLoading}
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
            readOnly={useFeatureTxLoading}
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
            readOnly={buyCreatorTokenTxLoading}
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
            readOnly={buyCreatorTokenTxLoading}
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
        setTokenPrices
      </Text>
      <Flex gap={"10px"} alignItems="flex-end">
        <VStack>
          <Text>existing creator tokens</Text>
          <Input
            placeholder="0x1234...,0x5678..."
            {...inputStyle}
            readOnly={setTokenPricesTxLoading}
            width="400px"
            isInvalid={
              creatorTokenAddressesStr
                .split(",")
                .filter((address) => !isAddress(address)).length > 0
            }
            value={creatorTokenAddressesStr}
            onChange={(e) => setCreatorTokenAddressesStr(e.target.value)}
          />
        </VStack>
        <VStack>
          <Text>how much ETH will these tokens cost?</Text>
          <Input
            placeholder="0.0005,0.0015,1200,..."
            {...inputStyle}
            readOnly={setTokenPricesTxLoading}
            width="500px"
            value={newTokenPricesStr}
            onChange={(e) => setNewTokenPricesStr(e.target.value)}
          />
        </VStack>
        {setTokenPricesTxLoading ? (
          <Spinner />
        ) : (
          <Button
            bg="#131323"
            _hover={{}}
            _focus={{}}
            _active={{}}
            onClick={handleSetTokenPrices}
            isDisabled={
              !isAddress(creatorTokenAddress) ||
              !setTokenPrices ||
              newTokenPricesStr.split(",").length !==
                creatorTokenAddressesStr.split(",").length
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
            readOnly={isApprovalLoading}
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
            readOnly={isApprovalLoading}
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
