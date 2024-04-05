import { Flex, Text, Button, Spinner, Input } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useCreateTempTokenState } from "../../../hooks/internal/temp-token/useCreateTempTokenState";
import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { useLazyQuery } from "@apollo/client";
import { GET_LIVEPEER_STREAM_DATA_QUERY } from "../../../constants/queries";
import { GetLivepeerStreamDataQuery } from "../../../generated/graphql";
import { filteredInput } from "../../../utils/validation/input";

export const TempTokenCreationModal = ({
  title,
  isOpen,
  handleClose,
}: {
  title: string;
  isOpen: boolean;
  handleClose: () => void;
}) => {
  const { channel } = useChannelContext();
  const { channelQueryData } = channel;
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
    isCreateTempTokenLoading,
    handleNewTokenName,
    handleNewTokenSymbol,
    handleNewTokenDuration,
  } = useCreateTempTokenState();

  useEffect(() => {
    const checkIfLiveBeforeCreateToken = async () => {
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
  }, [isOpen]);

  return (
    <TransactionModalTemplate
      title={title}
      isOpen={isOpen}
      handleClose={handleClose}
      hideFooter
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
          <Text>Name</Text>
          <Input
            placeholder="token name"
            variant="glow"
            value={newTokenName}
            onChange={(e) => handleNewTokenName(filteredInput(e.target.value))}
          />
          <Text>Symbol</Text>
          <Input
            placeholder="token symbol"
            variant="glow"
            value={newTokenSymbol}
            onChange={(e) =>
              handleNewTokenSymbol(filteredInput(e.target.value))
            }
          />
          <Flex gap="5px" justifyContent={"center"}>
            <Button
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg={newTokenDuration === BigInt("300") ? "#02d650" : "#ffffff"}
              onClick={() => handleNewTokenDuration(BigInt("300"))}
            >
              5 mins
            </Button>
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
              bg={newTokenDuration === BigInt("3600") ? "#02d650" : "#ffffff"}
              onClick={() => handleNewTokenDuration(BigInt("3600"))}
            >
              1 hour
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
