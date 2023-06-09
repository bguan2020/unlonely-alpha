import { Button, Flex, Input, Spinner, Text, VStack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { formatUnits, isAddress, isAddressEqual, parseUnits } from "viem";
import { erc20ABI, useAccount, useNetwork } from "wagmi";
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
import { getContract } from "../utils/contract";
import {
  filteredInput,
  formatIncompleteNumber,
} from "../utils/validation/input";

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
  const account = useAccount();
  const { admins } = useAdmins();

  const isAdmin = useMemo(() => {
    if (admins !== undefined && account?.address) {
      const user = account.address;
      return admins.some((admin) =>
        isAddressEqual(admin as `0x${string}`, user)
      );
    }
    return false;
  }, [account, admins]);

  return (
    <AppLayout isCustomHeader={false}>
      {isAdmin && <AdminContent />}
      {!isAdmin && <Text>You're not supposed to be here.</Text>}
    </AppLayout>
  );
}

const AdminContent = () => {
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return (
      NETWORKS.find((n) => n.config.chainId === network.chain?.id) ??
      NETWORKS[1]
    );
  }, [network]);
  const contract = getContract("unlonelyArcade", localNetwork);

  const [creatorTokenAddress, setCreatorTokenAddress] = useState<string>("");
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

  const { refetch, creatorToken, tokenPrice, tokenOwner } = useReadPublic(
    creatorTokenAddress as `0x${string}`
  );

  const { refetch: refetchEthAmount, amountIn } = useCalculateEthAmount(
    creatorTokenAddress as `0x${string}`,
    buyTokenAmount_bigint
  );

  const {
    requiresApproval,
    writeApproval,
    isTxLoading: isApprovalLoading,
  } = useApproval(
    creatorTokenAddress as `0x${string}`,
    erc20ABI,
    contract?.address as `0x${string}`,
    parseUnits(formatIncompleteNumber(buyTokenAmount) as `${number}`, 18),
    contract?.chainId as number
  );

  const {
    buyCreatorToken,
    buyCreatorTokenData,
    buyCreatorTxData,
    buyCreatorTxLoading,
  } = useBuyCreatorToken({
    creatorTokenAddress: creatorTokenAddress as `0x${string}`,
    amountIn,
    amountOut: buyTokenAmount_bigint,
  });

  const { useFeature, useFeatureData, useFeatureTxData, useFeatureTxLoading } =
    useUseFeature({
      creatorTokenAddress: creatorTokenAddress as `0x${string}`,
      featurePrice: parseUnits(
        formatIncompleteNumber(featurePrice) as `${number}`,
        18
      ),
    });

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
      onTxSuccess: refetch,
    }
  );

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
      onTxSuccess: refetch,
    }
  );

  const handleInputChange = (event: any, callback: (str: string) => void) => {
    const input = event.target.value;
    const filtered = filteredInput(input);
    callback(filtered);
  };

  const acceptableNewPrice = useMemo(() => {
    const newPrice = parseUnits(
      formatIncompleteNumber(tokenPriceState) as `${number}`,
      18
    );
    if (!tokenPrice && newPrice >= BigInt(0)) return true;
    return newPrice !== tokenPrice && newPrice >= BigInt(0);
  }, [tokenPrice, tokenPriceState]);

  return (
    <Flex direction="column" p="10px" gap="20px">
      <Flex>{localNetwork.config.name}</Flex>
      <Flex gap={"10px"} alignItems="flex-end">
        <VStack>
          <Text>new creator token address</Text>
          <Input
            {...inputStyle}
            width="400px"
            isInvalid={!isAddress(newCreatorTokenAddress)}
            value={newCreatorTokenAddress}
            onChange={(e) => setNewCreatorTokenAddress(e.target.value)}
          />
        </VStack>
        <VStack>
          <Text>how much eth will this new token cost?</Text>
          <Input
            width="400px"
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
            onClick={addCreatorToken}
            isDisabled={!addCreatorToken}
          >
            Send
          </Button>
        )}
      </Flex>
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
            width="500px"
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
        {buyCreatorTxLoading ? (
          <Spinner />
        ) : (
          <Button
            bg="#131323"
            _hover={{}}
            _focus={{}}
            _active={{}}
            onClick={buyCreatorToken}
            isDisabled={!isAddress(creatorTokenAddress) || !buyCreatorToken}
          >
            Send
          </Button>
        )}
      </Flex>
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
            onClick={setTokenPrice}
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
