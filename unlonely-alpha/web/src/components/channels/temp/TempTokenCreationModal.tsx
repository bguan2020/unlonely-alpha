import { Flex, Text, Button, Spinner, Input } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  EASY_THRESHOLD,
  HARD_THRESHOLD,
  MEDIUM_THRESHOLD,
  useCreateTempTokenState,
} from "../../../hooks/internal/temp-token/write/useCreateTempTokenState";
import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { useLazyQuery } from "@apollo/client";
import { GET_LIVEPEER_STREAM_DATA_QUERY } from "../../../constants/queries";
import { GetLivepeerStreamDataQuery } from "../../../generated/graphql";
import { alphanumericInput } from "../../../utils/validation/input";
import { formatUnits } from "viem";
import { truncateValue } from "../../../utils/tokenDisplayFormatting";
import { useCacheContext } from "../../../hooks/context/useCache";
import { bondingCurve, getContractFromNetwork } from "../../../utils/contract";
import { Contract } from "../../../constants";
import { useNetworkContext } from "../../../hooks/context/useNetwork";
import { tempTokenMinBaseTokenPrices } from "../../../constants/tempTokenMinBaseTokenPrices";

export const TempTokenCreationModal = ({
  title,
  isOpen,
  handleClose,
}: {
  title: string;
  isOpen: boolean;
  handleClose: () => void;
}) => {
  const { ethPriceInUsd } = useCacheContext();
  const { network } = useNetworkContext();
  const { localNetwork } = network;

  const factoryContract = getContractFromNetwork(
    Contract.TEMP_TOKEN_FACTORY_V1,
    localNetwork
  );

  const { channel } = useChannelContext();
  const { channelQueryData, realTimeChannelDetails } = channel;
  const [returnedIsLive, setReturnedIsLive] = useState<boolean | undefined>(
    undefined
  );

  const [getLivepeerStreamData] = useLazyQuery<GetLivepeerStreamDataQuery>(
    GET_LIVEPEER_STREAM_DATA_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

  const {
    createTempToken,
    newTokenName,
    newTokenSymbol,
    newTokenDuration,
    newPreSaleDuration,
    newTokenTotalSupplyThreshold,
    isCreateTempTokenLoading,
    handleNewTokenName,
    handleNewTokenSymbol,
    handleNewTokenDuration,
    handleNewTokenTotalSupplyThreshold,
    handlePreSaleDuration,
  } = useCreateTempTokenState({ callbackOnTxSuccess: handleClose });

  useEffect(() => {
    const checkIfLiveBeforeCreateToken = async () => {
      if (realTimeChannelDetails.isLive) {
        setReturnedIsLive(true);
        return;
      }
      if (isOpen) {
        setReturnedIsLive(undefined);
        const res = await getLivepeerStreamData({
          variables: {
            data: { streamId: channelQueryData?.livepeerStreamId },
          },
        });
        setReturnedIsLive(res.data?.getLivepeerStreamData?.isActive || false);
      }
    };
    checkIfLiveBeforeCreateToken();
  }, [
    isOpen,
    realTimeChannelDetails.isLive,
    channelQueryData?.livepeerStreamId,
  ]);

  return (
    <TransactionModalTemplate
      title={title}
      isOpen={isOpen}
      handleClose={handleClose}
      hideFooter
      bg={"#18162F"}
    >
      {returnedIsLive === undefined ? (
        <Flex direction="column" gap="5px">
          <Text textAlign={"center"}>Checking stream status...</Text>
          <Flex justifyContent={"center"}>
            <Spinner />
          </Flex>
        </Flex>
      ) : returnedIsLive === true ? (
        <Flex direction="column" gap="5px">
          <Text>Token Symbol</Text>
          <Input
            placeholder="token symbol"
            variant="glow"
            value={newTokenSymbol}
            onChange={(e) => {
              handleNewTokenSymbol(alphanumericInput(e.target.value));
              handleNewTokenName(alphanumericInput(e.target.value));
            }}
          />
          <Text>Token Name</Text>
          <Input
            placeholder="token name"
            variant="glow"
            value={newTokenName}
            onChange={(e) =>
              handleNewTokenName(alphanumericInput(e.target.value))
            }
          />
          <Text>Price goal difficulty</Text>
          <Flex gap="5px" justifyContent={"center"}>
            <Button
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg={
                newTokenTotalSupplyThreshold === BigInt(EASY_THRESHOLD)
                  ? "#02d650"
                  : "#ffffff"
              }
              onClick={() =>
                handleNewTokenTotalSupplyThreshold(BigInt(EASY_THRESHOLD))
              }
            >
              <Text>EASY</Text>
            </Button>
            <Button
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg={
                newTokenTotalSupplyThreshold === MEDIUM_THRESHOLD
                  ? "#02d650"
                  : "#ffffff"
              }
              onClick={() =>
                handleNewTokenTotalSupplyThreshold(MEDIUM_THRESHOLD)
              }
            >
              <Text>NORMAL</Text>
            </Button>
            <Button
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg={
                newTokenTotalSupplyThreshold === HARD_THRESHOLD
                  ? "#02d650"
                  : "#ffffff"
              }
              onClick={() => handleNewTokenTotalSupplyThreshold(HARD_THRESHOLD)}
            >
              <Text>HARD</Text>
            </Button>
          </Flex>
          <Text textAlign="center" fontSize="13px" color="#2fe043">
            {truncateValue(String(newTokenTotalSupplyThreshold), 0)} tokens to
            hit{" "}
            {`$${getUsdPriceFromEthPriceOfThreshold(
              Number(ethPriceInUsd),
              getEthPriceOfThreshold(
                newTokenTotalSupplyThreshold,
                tempTokenMinBaseTokenPrices[
                  `${factoryContract.address?.toLowerCase()}:${
                    factoryContract.chainId
                  }`
                ] ?? BigInt(0)
              )
            )}`}
            , needs{" "}
            {truncateValue(
              formatUnits(
                getCostInWeiToBuyToThreshold(
                  newTokenTotalSupplyThreshold,
                  tempTokenMinBaseTokenPrices[
                    `${factoryContract.address?.toLowerCase()}:${
                      factoryContract.chainId
                    }`
                  ] ?? BigInt(0)
                ),
                18
              ),
              4
            )}{" "}
            ETH
          </Text>
          <Text>Duration</Text>
          <Flex gap="5px" justifyContent={"center"}>
            {/* <Button
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg={newTokenDuration === BigInt("120") ? "#02d650" : "#ffffff"}
              onClick={() => handleNewTokenDuration(BigInt("120"))}
            >
              2 mins
            </Button>
            <Button
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg={newTokenDuration === BigInt("300") ? "#02d650" : "#ffffff"}
              onClick={() => handleNewTokenDuration(BigInt("300"))}
            >
              5 mins
            </Button> */}
            <Button
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg={newTokenDuration === BigInt("600") ? "#02d650" : "#ffffff"}
              onClick={() => handleNewTokenDuration(BigInt("600"))}
            >
              10 mins
            </Button>
            <Button
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg={newTokenDuration === BigInt("1800") ? "#02d650" : "#ffffff"}
              onClick={() => handleNewTokenDuration(BigInt("1800"))}
            >
              30 mins
            </Button>
            <Button
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg={newTokenDuration === BigInt("2700") ? "#02d650" : "#ffffff"}
              onClick={() => handleNewTokenDuration(BigInt("2700"))}
            >
              45 mins
            </Button>
          </Flex>
          <Button
            onClick={createTempToken}
            isDisabled={
              !createTempToken ||
              isCreateTempTokenLoading ||
              !newTokenName ||
              !newTokenSymbol
            }
          >
            {isCreateTempTokenLoading || !createTempToken ? (
              <Spinner />
            ) : (
              "create"
            )}
          </Button>
        </Flex>
      ) : (
        <Flex direction="column" gap="5px">
          <Text textAlign="center">You don't seem to be live</Text>
          <Text textAlign="center">
            please try creating a token again later once you are live
          </Text>
          <Button onClick={handleClose}>close</Button>
        </Flex>
      )}
    </TransactionModalTemplate>
  );
};

const getEthPriceOfThreshold = (
  threshold: bigint,
  minBaseTokenPrice: bigint
) => {
  if (threshold === BigInt(0)) return 0;
  const n = threshold;
  const n_ = n > BigInt(0) ? n - BigInt(1) : BigInt(0);
  const priceForCurrent = BigInt(Math.floor(bondingCurve(Number(n))));
  const priceForPrevious = BigInt(Math.floor(bondingCurve(Number(n_))));

  const newPrice = priceForCurrent - priceForPrevious + minBaseTokenPrice;
  return Number(newPrice);
};

const getUsdPriceFromEthPriceOfThreshold = (
  ethPriceInUsd: number,
  ethPriceOfThreshold: number
) => {
  return truncateValue(
    Number(formatUnits(BigInt(ethPriceOfThreshold), 18)) * ethPriceInUsd,
    4
  );
};

const getCostInWeiToBuyToThreshold = (
  threshold: bigint,
  minBaseTokenPrice: bigint
): bigint => {
  const n = threshold;
  const cost = BigInt(Math.floor(bondingCurve(Number(n))));
  const modifiedCost = cost + n * minBaseTokenPrice;
  return modifiedCost;
};
