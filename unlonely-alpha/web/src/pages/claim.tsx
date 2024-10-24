import {
  Text,
  Flex,
  Box,
  Avatar,
  SimpleGrid,
  Button,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useCallback, useState, useMemo } from "react";
import { formatUnits } from "viem";
import Link from "next/link";

import { WavyText } from "../components/general/WavyText";
import AppLayout from "../components/layout/AppLayout";
import { anonUrl } from "../components/presence/AnonUrl";
import {
  Channel,
  EventType,
  SharesEvent,
  SharesEventState,
} from "../generated/graphql";
import { useNetworkContext } from "../hooks/context/useNetwork";
import { useUser } from "../hooks/context/useUser";
import { useClaimVotePayout } from "../hooks/contracts/legacy/useSharesContractV2";
import centerEllipses from "../utils/centerEllipses";
import { getContractFromNetwork, returnDecodedTopics } from "../utils/contract";
import { truncateValue } from "../utils/tokenDisplayFormatting";
import useCloseSharesEvent from "../hooks/server/channel/useCloseSharesEvent";
import usePostClaimPayout from "../hooks/server/usePostClaimPayout";
import { getColorFromString } from "../styles/Colors";
import { useCacheContext } from "../hooks/context/useCache";
import { CHAKRA_UI_TX_TOAST_DURATION, Contract } from "../constants";

export default function ClaimPage() {
  const { user, wagmiAddress } = useUser();

  return (
    <AppLayout isCustomHeader={false}>
      {user && wagmiAddress ? (
        <ClaimContent />
      ) : (
        <Text>You must be logged in to see this page.</Text>
      )}
    </AppLayout>
  );
}

const ClaimContent = () => {
  const {
    claimableBets,
    fetchingBets,
    channelFeed: channels,
    feedLoading,
  } = useCacheContext();

  const [claimedPayouts, setClaimedPayouts] = useState<SharesEvent[]>([]);

  const addPayoutToClaimedPayouts = useCallback((event: SharesEvent) => {
    setClaimedPayouts((prev) => [...prev, event]);
  }, []);

  return (
    <>
      {!feedLoading && !fetchingBets ? (
        <Flex direction="column">
          <Text
            fontSize={["40px", "50px", "50px"]}
            fontFamily={"LoRes15"}
            textAlign="center"
          >
            claim payouts
          </Text>
          <Flex gap="10px" mt="20px" justifyContent={"center"}>
            {claimableBets.length > 0 ? (
              <EventsDashboard
                channels={
                  channels?.filter(
                    (channel): channel is Channel => channel !== null
                  ) ?? []
                }
                claimableBets={claimableBets}
                claimedPayouts={claimedPayouts}
                addPayoutToClaimedPayouts={addPayoutToClaimedPayouts}
              />
            ) : (
              <Flex justifyContent={"center"} flexGrow={1} alignItems="center">
                <Text textAlign={"center"} fontSize={"12px"}>
                  We can't find any payouts waiting for you, please try again
                  later
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>
      ) : (
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          width="100%"
          height="calc(100vh - 64px)"
          fontSize="50px"
        >
          <WavyText text="loading..." />
        </Flex>
      )}
    </>
  );
};

type UnclaimedBet = SharesEvent & {
  payout: bigint;
};

const EventsDashboard = ({
  channels,
  claimableBets,
  claimedPayouts,
  addPayoutToClaimedPayouts,
}: {
  channels: Channel[];
  claimableBets: UnclaimedBet[];
  claimedPayouts: SharesEvent[];
  addPayoutToClaimedPayouts: (event: SharesEvent) => void;
}) => {
  return (
    <Flex bg="rgba(0, 0, 0, 0.3)" mx="1rem" p="1rem" borderRadius="15px">
      <Flex direction="column">
        <>
          {claimableBets.length > 0 ? (
            <SimpleGrid columns={[1, 3, 4, 4]} spacing={10}>
              {claimableBets.map((event, i) => (
                <EventCard
                  channels={channels}
                  key={i}
                  event={event}
                  claimedPayouts={claimedPayouts}
                  addPayoutToClaimedPayouts={addPayoutToClaimedPayouts}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Flex direction="column" gap="1rem">
              <Text
                textAlign={"center"}
                fontFamily={"LoRes15"}
                fontSize={"25px"}
              >
                We can't find any payouts waiting for you from this channel
              </Text>
              <Text textAlign={"center"}>
                To see payouts from all channels, unselect the current channel
              </Text>
            </Flex>
          )}
        </>
      </Flex>
    </Flex>
  );
};

const EventCard = ({
  event,
  channels,
  claimedPayouts,
  addPayoutToClaimedPayouts,
}: {
  event: UnclaimedBet;
  channels: Channel[];
  claimedPayouts: SharesEvent[];
  addPayoutToClaimedPayouts: (event: SharesEvent) => void;
}) => {
  const { wagmiAddress } = useUser();
  const { network } = useNetworkContext();
  const { localNetwork, explorerUrl } = network;
  const contractData = getContractFromNetwork(Contract.SHARES_V2, localNetwork);
  const toast = useToast();

  const [calling, setCalling] = useState(false);

  const matchingChannel = useMemo(
    () => channels.find((channel) => channel.id === event.channelId),
    [channels, event.channelId]
  );

  const imageUrl = matchingChannel?.owner?.FCImageUrl
    ? matchingChannel?.owner.FCImageUrl
    : matchingChannel?.owner?.lensImageUrl
    ? matchingChannel?.owner.lensImageUrl
    : anonUrl;
  const ipfsUrl = imageUrl.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${imageUrl.slice(7)}`
    : imageUrl;

  const alreadyClaimed = useMemo(
    () => claimedPayouts.some((claimedPayout) => claimedPayout.id === event.id),
    [claimedPayouts, event.id]
  );

  const { postClaimPayout } = usePostClaimPayout({
    onError: (err) => {
      console.log(err);
    },
  });
  const { closeSharesEvents } = useCloseSharesEvent({
    onError: (err) => {
      console.log(err);
    },
  });

  const { claimVotePayout, claimVotePayoutTxLoading } = useClaimVotePayout(
    {
      eventAddress: event.sharesSubjectAddress as `0x${string}`,
      eventId: Number(event.id ?? "0"),
      canClaim:
        (event.eventState === SharesEventState.PayoutPrevious ||
          event.eventState === SharesEventState.Payout) &&
        event.payout > BigInt(0),
    },
    contractData,
    {
      onWriteSuccess: (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#287ab0" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.hash}`}
                passHref
              >
                claimVotePayout pending, click to view
              </Link>
            </Box>
          ),
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
      },
      onWriteError: (error) => {
        toast({
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              claimVotePayout cancelled
            </Box>
          ),
        });
        setCalling(false);
      },
      onTxSuccess: async (data) => {
        if (!calling) return;
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                claimVotePayout success, click to view
              </Link>
            </Box>
          ),
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
        const topics = returnDecodedTopics(
          data.logs,
          contractData.abi,
          "Payout"
        );
        if (!topics) {
          setCalling(false);
          return;
        }
        const args: any = topics.args;
        await postClaimPayout({
          channelId: event.channelId as string,
          userAddress: wagmiAddress as `0x${string}`,
          eventId: Number(event.id),
          eventType: EventType.YayNayVote,
        });
        if ((args.votingPooledEth as bigint) === BigInt(0)) {
          await closeSharesEvents({
            chainId: localNetwork.config.chainId,
            channelId: event.channelId as string,
            sharesEventIds: [Number(event.id)],
          });
        }
        addPayoutToClaimedPayouts(event);
        setCalling(false);
      },
      onTxError: (error) => {
        if (!calling) return;
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              claimVotePayout error
            </Box>
          ),
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
        setCalling(false);
      },
    }
  );

  return (
    <Flex
      direction="column"
      bg="#19162F"
      p="1rem"
      borderRadius="15px"
      justifyContent={"space-between"}
    >
      <Flex gap="15px" mb="5px">
        <Avatar
          name={
            matchingChannel?.owner.username
              ? matchingChannel?.owner.username
              : matchingChannel?.owner?.address
          }
          src={ipfsUrl}
          bg={getColorFromString(
            matchingChannel?.owner.username
              ? matchingChannel?.owner.username
              : matchingChannel?.owner?.address ?? ""
          )}
          size="sm"
        />
        <Flex direction="column">
          <Text fontFamily="LoRes15">
            {matchingChannel?.owner.username ??
              centerEllipses(matchingChannel?.owner?.address, 13)}
          </Text>
          <Text
            textAlign={"center"}
            color="#8a8a8a"
            fontSize={"10px"}
            fontWeight={"bold"}
          >
            {new Date(event.createdAt).toLocaleString()}
          </Text>
        </Flex>
      </Flex>
      <Text textAlign={"center"} fontSize={"20px"} fontWeight={"bold"}>
        {event.sharesSubjectQuestion}
      </Text>
      <Flex direction="column">
        {(event?.resultIndex ?? -1) >= 0 && (
          <Flex justifyContent={"center"}>
            <Text
              textAlign={"center"}
              fontSize="18px"
              fontWeight="bold"
              color={
                event.resultIndex === 0
                  ? "rgba(10, 179, 18, 1)"
                  : "rgba(218, 58, 19, 1)"
              }
            >
              {event.resultIndex === 0
                ? event.options?.[0] ?? "Yes"
                : event.options?.[1] ?? "No"}
            </Text>
          </Flex>
        )}
        <>
          {alreadyClaimed ? (
            <Text
              textAlign={"center"}
              fontSize={["20px", "20px", "35px"]}
              fontFamily="LoRes15"
              color={"#ffce8f"}
            >
              claimed!
            </Text>
          ) : (
            <Button
              color="white"
              _hover={{ transform: "scale(1.1)" }}
              _focus={{}}
              _active={{}}
              bg={"#09b311"}
              borderRadius="25px"
              isDisabled={
                !claimVotePayout || claimVotePayoutTxLoading || calling
              }
              onClick={() => {
                setCalling(true);
                claimVotePayout?.();
              }}
              width="100%"
            >
              {!claimVotePayout ? (
                <Text fontSize="20px">tx simulation failed</Text>
              ) : claimVotePayoutTxLoading || calling ? (
                <Spinner />
              ) : (
                <Text fontSize="20px">
                  {truncateValue(formatUnits(event.payout, 18))} ETH
                </Text>
              )}
            </Button>
          )}
        </>
      </Flex>
    </Flex>
  );
};
