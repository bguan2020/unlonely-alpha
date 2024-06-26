import { useLazyQuery } from "@apollo/client";
import { useState, useEffect } from "react";
import { GET_LIVEPEER_STREAM_DATA_QUERY } from "../../../constants/queries";
import { GetLivepeerStreamDataQuery } from "../../../generated/graphql";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { useCreateMultipleTempTokensState } from "../../../hooks/internal/temp-token/write/useCreateMultipleTempTokensState";
import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";
import { Flex, Spinner, Input, Button, Text } from "@chakra-ui/react";
import { alphanumericInput } from "../../../utils/validation/input";

export const VersusTokenCreationModal = ({
  title,
  isOpen,
  handleClose,
}: {
  title: string;
  isOpen: boolean;
  handleClose: () => void;
}) => {
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

  useEffect(() => {
    const checkIfLiveBeforeCreateToken = async () => {
      // setReturnedIsLive(true);
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

  const {
    newTokenAName,
    newTokenASymbol,
    newTokenBName,
    newTokenBSymbol,
    newPreSaleDuration,
    newDuration,
    createMultipleTempTokens,
    isCreateMultipleTempTokensLoading,
    handleTokenName,
    handleTokenSymbol,
    handleNewDuration,
    handlePreSaleDuration,
  } = useCreateMultipleTempTokensState({ callbackOnTxSuccess: handleClose });

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
          <Text>Token Symbols</Text>
          <Flex gap="5px">
            <Input
              placeholder="token a symbol"
              variant="redGlow"
              value={newTokenASymbol}
              onChange={(e) => {
                handleTokenSymbol(alphanumericInput(e.target.value), "a");
                handleTokenName(alphanumericInput(e.target.value), "a");
              }}
            />
            <Input
              placeholder="token b symbol"
              variant="glow"
              value={newTokenBSymbol}
              onChange={(e) => {
                handleTokenSymbol(alphanumericInput(e.target.value), "b");
                handleTokenName(alphanumericInput(e.target.value), "b");
              }}
            />
          </Flex>
          <Text>Token Names</Text>
          <Flex gap="5px">
            <Input
              placeholder="token a name"
              variant="redGlow"
              value={newTokenAName}
              onChange={(e) =>
                handleTokenName(alphanumericInput(e.target.value), "a")
              }
            />
            <Input
              placeholder="token b name"
              variant="glow"
              value={newTokenBName}
              onChange={(e) =>
                handleTokenName(alphanumericInput(e.target.value), "b")
              }
            />
          </Flex>
          <Text>Duration</Text>
          <Flex gap="5px" justifyContent={"center"}>
            {/* <Button
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg={newDuration === BigInt("120") ? "#02d650" : "#ffffff"}
              onClick={() => handleNewDuration(BigInt("120"))}
            >
              2 mins
            </Button> */}
            {/* <Button
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg={newDuration === BigInt("300") ? "#02d650" : "#ffffff"}
              onClick={() => handleNewDuration(BigInt("300"))}
            >
              5 mins
            </Button> */}
            <Button
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg={newDuration === BigInt("600") ? "#02d650" : "#ffffff"}
              onClick={() => handleNewDuration(BigInt("600"))}
            >
              10 mins
            </Button>
            <Button
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg={newDuration === BigInt("1800") ? "#02d650" : "#ffffff"}
              onClick={() => handleNewDuration(BigInt("1800"))}
            >
              30 mins
            </Button>
            <Button
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg={newDuration === BigInt("2700") ? "#02d650" : "#ffffff"}
              onClick={() => handleNewDuration(BigInt("2700"))}
            >
              45 mins
            </Button>
          </Flex>
          <Button
            onClick={createMultipleTempTokens}
            isDisabled={
              !createMultipleTempTokens ||
              isCreateMultipleTempTokensLoading ||
              !newTokenAName ||
              !newTokenASymbol ||
              !newTokenBName ||
              !newTokenBSymbol
            }
          >
            {isCreateMultipleTempTokensLoading || !createMultipleTempTokens ? (
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
            please try again later once you are live
          </Text>
          <Button onClick={handleClose}>close</Button>
        </Flex>
      )}
    </TransactionModalTemplate>
  );
};
