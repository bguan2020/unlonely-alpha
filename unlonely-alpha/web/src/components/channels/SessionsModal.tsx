import { useEffect, useMemo, useState, useCallback } from "react";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useApolloClient } from "@apollo/client";
import { GET_LIVEPEER_STREAM_SESSIONS_DATA_QUERY } from "../../constants/queries";
import { LivepeerStreamSessionsData } from "../../generated/graphql";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";
import { Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { formatTimestampToDate, getTimeFromMillis } from "../../utils/time";
import { MdOutlineCloudDownload } from "react-icons/md";

const ITEMS_PER_PAGE = 10;

export const SessionsModal = ({
  title,
  isOpen,
  callback,
  handleClose,
}: {
  title: string;
  isOpen: boolean;
  callback?: any;
  handleClose: () => void;
}) => {
  const { channel } = useChannelContext();
  const { channelQueryData } = channel;

  const client = useApolloClient();
  const [page, setPage] = useState(0);
  const [sessions, setSessions] = useState<LivepeerStreamSessionsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>("");

  const livepeerStreamId = useMemo(() => {
    return channelQueryData?.livepeerStreamId ?? undefined;
  }, [channelQueryData]);

  const [error, setError] = useState<string>("");
  const [hasMore, setHasMore] = useState(true);

  const fetch = useCallback(
    async (_page: number) => {
      if (!livepeerStreamId || !isOpen) return;
      setLoading(true);
      setError("");
      try {
        const sessions = await client
          .query({
            query: GET_LIVEPEER_STREAM_SESSIONS_DATA_QUERY,
            variables: {
              data: {
                streamId: livepeerStreamId,
                limit: ITEMS_PER_PAGE,
                skip: ITEMS_PER_PAGE * _page,
              },
            },
          })
          .then((res: any) => res.data.getLivepeerStreamSessionsData);
        setLoading(false);
        setSessions((prev) => [...prev, ...sessions]);
        setHasMore(sessions.length === ITEMS_PER_PAGE);
      } catch (err) {
        setLoading(false);
        setError("Failed to fetch sessions. Please try again.");
        console.error("Error fetching sessions:", err);
      }
    },
    [livepeerStreamId, client, isOpen]
  );

  useEffect(() => {
    if (sessions.length === 0 && isOpen && livepeerStreamId) {
      fetch(0);
    }
  }, [livepeerStreamId, isOpen, sessions, fetch]);

  return (
    <TransactionModalTemplate
      title={title}
      hideFooter={true}
      isOpen={isOpen}
      handleClose={() => {
        setSelectedVideoUrl("");
        handleClose();
      }}
    >
      <Flex direction={"column"} gap="10px">
        {selectedVideoUrl.length > 0 && (
          <video key={selectedVideoUrl} controls loop preload="metadata">
            <source
              src={selectedVideoUrl.concat("#t=0.1")}
              type="video/mp4"
            ></source>
          </video>
        )}
        <Flex
          direction={"column"}
          gap="10px"
          maxHeight="300px"
          overflowY={"scroll"}
        >
          {sessions.map((session) => {
            return (
              <Flex
                key={session.id}
                _hover={{}}
                p="10px"
                bg="rgba(0, 0, 0, 0.5)"
                borderRadius={"15px"}
                direction="column"
                gap="5px"
              >
                <Flex alignItems={"center"} justifyContent={"space-between"}>
                  <Flex direction="column">
                    <Text fontSize="12px">
                      {formatTimestampToDate(session.createdAt)}
                    </Text>
                    <Text fontSize="12px" color="#acacac">
                      {getTimeFromMillis(session.duration * 1000, true)}
                    </Text>
                  </Flex>
                  {session.mp4Url.length > 0 ? (
                    <Flex gap="10px">
                      <Button
                        _hover={{}}
                        _active={{}}
                        _focus={{}}
                        bg="#0e9f4a"
                        onClick={() => setSelectedVideoUrl(session.mp4Url)}
                      >
                        <Text color="white">view</Text>
                      </Button>
                      <a href={session.mp4Url} download="video.mp4">
                        <Button
                          _hover={{}}
                          _active={{}}
                          _focus={{}}
                          bg="#0e7d9f"
                        >
                          <Text color="white">
                            <MdOutlineCloudDownload size={20} />
                          </Text>
                        </Button>
                      </a>
                    </Flex>
                  ) : (
                    <Button
                      _hover={{}}
                      _active={{}}
                      _focus={{}}
                      bg="#9f260e"
                      isDisabled
                    >
                      <Text color="white">no recording</Text>
                    </Button>
                  )}
                </Flex>
                <Text fontSize="10px" color="#acacac" textAlign="right">
                  id:{session.id}
                </Text>
              </Flex>
            );
          })}
          {sessions.length === 0 && !loading && <Text>No sessions found</Text>}
          {error && <Text color="red.500">{error}</Text>}
        </Flex>
        {loading ? (
          <Flex justifyContent={"center"}>
            <Spinner />
          </Flex>
        ) : sessions.length > 0 && hasMore ? (
          <Button
            _hover={{
              transform: "scale(1.05)",
            }}
            _active={{}}
            _focus={{}}
            bg="#185fa5"
            onClick={() => {
              fetch(page + 1);
              setPage((prev) => prev + 1);
            }}
          >
            <Text color="white">load more</Text>
          </Button>
        ) : null}
      </Flex>
    </TransactionModalTemplate>
  );
};
