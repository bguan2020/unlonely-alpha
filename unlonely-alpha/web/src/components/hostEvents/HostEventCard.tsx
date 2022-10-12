import { Text, Grid, GridItem, Flex } from "@chakra-ui/layout";
import { Button, Image, Tooltip, useToast } from "@chakra-ui/react";
import { gql } from "@apollo/client";
import { useState } from "react";
import { useAccount } from "wagmi";

import { HostEventCard_HostEventFragment } from "../../generated/graphql";
import useLike from "../../hooks/useLike";

import { UpVoteIcon, UpVoteIconSalmon } from "../icons/UpVoteIcon";
import { DownVoteIcon, DownVoteIconSalmon } from "../icons/DownVoteIcon";
import NebulousButton from "../general/button/NebulousButton";
import { dateConverter } from "../../utils/timestampConverter";
import { useUser } from "../../hooks/useUser";
import EventState from "./EventState";
import ChallengeModal from "./ChallengeModal";

type Props = {
  hostEvent: HostEventCard_HostEventFragment;
};

const unlonelyAvatar = "https://i.imgur.com/MNArpwV.png";

const HostEventCard = ({ hostEvent }: Props) => {
  const { user } = useUser();
  const { like, dislike } = useLike({ id: hostEvent.id, powerLvl: user?.powerUserLvl});
  const { like: likeChallenge, dislike: dislikeChallenge } = useLike({ id: hostEvent.challenge?.id, powerLvl: user?.powerUserLvl});
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const accountData = useAccount();
  const toast = useToast();

  const submitLike = async () => {
    setButtonDisabled(true);
    await like();

    setTimeout(() => {
      setButtonDisabled(false);
    }, 3000);
  };

  const submitDislike = async () => {
    setButtonDisabled(true);
    await dislike();

    setTimeout(() => {
      setButtonDisabled(false);
    }, 3000);
  };

  const submitLikeChallenge = async () => {
    setButtonDisabled(true);
    await likeChallenge();

    setTimeout(() => {
      setButtonDisabled(false);
    }, 3000);
  };

  const submitDislikeChallenge = async () => {
    setButtonDisabled(true);
    await dislikeChallenge();

    setTimeout(() => {
      setButtonDisabled(false);
    }, 3000);
  };

  // function to determine if hostEvent.hostDate is in the past by more than an hour, or if hostEvent.hostDate is less than 1 hour in the past, or if hostEvent.hostDate is in the future
  const eventDateState = (hostDate: string) => {
    // function to determine if hostEvent.hostDate is in the past by more than an hour, or if hostEvent.hostDate is less than 1 hour in the past, or if hostEvent.hostDate is in the future
    const hostEventDate = new Date(hostEvent.hostDate);
    const now = new Date();
    const dayFuture = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (hostEventDate < now) {
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      if (hostEventDate < hourAgo) {
        return "past";
      } else {
        return "live";
      }
    }
    // else if hostEventDate is less than 24 hour in the future
    else if (hostEventDate < dayFuture) {
      return "up next";
    }
  };
  

  return (
    <>
      <Flex
        direction="column"
        alignItems="left"
        w={{ base: "100%", md: "60%", lg: "60%", sm: "100%" }}
      >
        <Text fontWeight="bold">
          {dateConverter(hostEvent.hostDate)}
        </Text>
      </Flex>
      <Flex
        direction="column"
        bg="#F1F4F8"
        w={{ base: "100%", md: "60%", lg: "60%", sm: "100%" }}
        h="9rem"
        padding="0.3rem"
        borderRadius="1rem"
        minH="5rem"
        mb="1.5rem"
        mt="8px"
        boxShadow="0px 0px 16px rgba(0, 0, 0, 0.25)"
      >
        <Grid templateColumns="1fr 1fr" gap="0.3125rem" width="100%" height="100%">
          <GridItem colSpan={1} position="relative">
            <Flex
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <EventState eventDateState={eventDateState(hostEvent.hostDate)}/>
              <Flex>
                <Tooltip label="vote on who you want to host">
                {user?.address ? (
                  <span>
                    <NebulousButton
                      opacity={hostEvent.liked ? "1" : "0.5"}
                      aria-label="like"
                      onClick={submitLike}
                      disabled={buttonDisabled}
                    >
                      {hostEvent.liked === true ? (
                        <UpVoteIconSalmon boxSize={5} />
                      ) : (
                        <UpVoteIcon boxSize={5} />
                      )}
                    </NebulousButton>
                  </span>
                ) : (
                  <span>
                    <NebulousButton
                      opacity="0.5"
                      aria-label="like"
                      onClick={() =>
                        toast({
                          title: "Sign in first.",
                          description: "Please sign into your wallet first.",
                          status: "warning",
                          duration: 9000,
                          isClosable: true,
                          position: "top",
                        })
                      }
                      disabled={buttonDisabled}
                    >
                      {hostEvent.liked === true ? (
                        <UpVoteIconSalmon boxSize={5} />
                      ) : (
                        <UpVoteIcon boxSize={5} />
                      )}
                    </NebulousButton>
                  </span>
                )}
                </Tooltip>
                <Text fontSize="18px" m="2px">
                  {hostEvent.score}
                </Text>
                <Tooltip label="vote on who you want to host">
                  {accountData?.address ? (
                    <span>
                      <NebulousButton
                        opacity={hostEvent.disliked ? "1" : "0.5"}
                        aria-label="like"
                        onClick={submitDislike}
                        disabled={buttonDisabled}
                      >
                        {hostEvent.disliked === true ? (
                          <DownVoteIconSalmon boxSize={5} />
                        ) : (
                          <DownVoteIcon boxSize={5} />
                        )}
                      </NebulousButton>
                    </span>
                  ) : (
                    <span>
                      <NebulousButton
                        opacity="0.5"
                        aria-label="like"
                        onClick={() =>
                          toast({
                            title: "Sign in first.",
                            description: "Please sign into your wallet first.",
                            status: "warning",
                            duration: 9000,
                            isClosable: true,
                            position: "top",
                          })
                        }
                        disabled={buttonDisabled}
                      >
                        {hostEvent.disliked === true ? (
                          <DownVoteIconSalmon boxSize={5} />
                        ) : (
                          <DownVoteIcon boxSize={5} />
                        )}
                      </NebulousButton>
                    </span>
                  )}
                </Tooltip>

              </Flex>
            </Flex>
            <Grid templateColumns="1fr 2fr" gap="0.1rem" width="100%" height="100%" mt="0.6rem" ml="0.6rem">
              <GridItem colSpan={1} ml="0.1rem" overflow="hidden" justifyItems="center">
                <Image height="66px"
                  width="66px" 
                  objectFit="cover"
                  src={hostEvent.owner.FCImageUrl ? hostEvent.owner.FCImageUrl : unlonelyAvatar} borderRadius="full"
                  m="auto"
                />
                <Text fontSize="12px" noOfLines={1} color="#737373" fontWeight="light" textAlign="center">
                  {hostEvent.owner.username}
                </Text>
              </GridItem>
              <GridItem colSpan={1} ml="0.1rem" overflow="hidden" justifyItems="center">
                <Text fontFamily="Inter" fontSize="18px" noOfLines={2} color="#000000" fontWeight="100" textAlign="left">
                  {hostEvent.title}
                </Text>
                <Text fontFamily="Inter" fontSize="12px" noOfLines={1} color="#737373" fontWeight="light" textAlign="left" fontStyle="">
                  {hostEvent.description}
                </Text>
              </GridItem>
            </Grid>
            <Flex position="absolute" right="4px" bottom="0px">
              {!hostEvent.challenge ? (
                <Text color="rgba(0, 159, 35, 0.4)" fontSize="36px" fontWeight="bold">
                  WINNING
                </Text>
              ) : (
                <>
                  {hostEvent.score > hostEvent.challenge.score ? (
                    <Text color="rgba(0, 159, 35, 0.4)" fontSize="36px" fontWeight="bold">
                      WINNING
                    </Text>
                  ) : (
                    <Text color="rgba(159, 0, 0, 0.4)" fontSize="36px" fontWeight="bold">
                      LOSING
                    </Text>
                  )
                  }
                </>
              )}
            </Flex>
          </GridItem>
          <GridItem colSpan={1} borderLeft="1px" position="relative">
            {hostEvent.challenge ? (
              <>
                <Flex
                  justifyContent="space-between"
                  alignItems="center"
                  width="100%"
                >
                  <Flex/>
                  <Flex>
                    <Tooltip label="vote on who you want to host">
                    {user?.address ? (
                      <span>
                        <NebulousButton
                          opacity={hostEvent.challenge.liked ? "1" : "0.5"}
                          aria-label="like"
                          onClick={submitLikeChallenge}
                          disabled={buttonDisabled}
                        >
                          {hostEvent.challenge.liked === true ? (
                            <UpVoteIconSalmon boxSize={5} />
                          ) : (
                            <UpVoteIcon boxSize={5} />
                          )}
                        </NebulousButton>
                      </span>
                    ) : (
                      <span>
                        <NebulousButton
                          opacity="0.5"
                          aria-label="like"
                          onClick={() =>
                            toast({
                              title: "Sign in first.",
                              description: "Please sign into your wallet first.",
                              status: "warning",
                              duration: 9000,
                              isClosable: true,
                              position: "top",
                            })
                          }
                          disabled={buttonDisabled}
                        >
                          {hostEvent.challenge.liked === true ? (
                            <UpVoteIconSalmon boxSize={5} />
                          ) : (
                            <UpVoteIcon boxSize={5} />
                          )}
                        </NebulousButton>
                      </span>
                    )}
                    </Tooltip>
                    <Text fontSize="18px" m="2px">
                      {hostEvent.challenge.score}
                    </Text>
                    <Tooltip label="vote on who you want to host">
                      {user?.address ? (
                        <span>
                          <NebulousButton
                            opacity={hostEvent.challenge.disliked ? "1" : "0.5"}
                            aria-label="like"
                            onClick={submitDislikeChallenge}
                            disabled={buttonDisabled}
                          >
                            {hostEvent.challenge.disliked === true ? (
                              <DownVoteIconSalmon boxSize={5} />
                            ) : (
                              <DownVoteIcon boxSize={5} />
                            )}
                          </NebulousButton>
                        </span>
                      ) : (
                        <span>
                          <NebulousButton
                            opacity="0.5"
                            aria-label="like"
                            onClick={() =>
                              toast({
                                title: "Sign in first.",
                                description: "Please sign into your wallet first.",
                                status: "warning",
                                duration: 9000,
                                isClosable: true,
                                position: "top",
                              })
                            }
                            disabled={buttonDisabled}
                          >
                            {hostEvent.challenge.disliked === true ? (
                              <DownVoteIconSalmon boxSize={5} />
                            ) : (
                              <DownVoteIcon boxSize={5} />
                            )}
                          </NebulousButton>
                        </span>
                      )}
                    </Tooltip>
                  </Flex>
                </Flex>
                <Grid templateColumns="1fr 2fr" gap="0.1rem" width="100%" height="100%" mt="0.6rem" ml="0.6rem">
                  <GridItem colSpan={1} ml="0.1rem" overflow="hidden" justifyItems="center">
                    <Image height="66px"
                      width="66px" 
                      objectFit="cover"
                      src={hostEvent.challenge.owner.FCImageUrl ? hostEvent.challenge.owner.FCImageUrl : unlonelyAvatar} borderRadius="full"
                      m="auto"
                    />
                    <Text fontSize="12px" noOfLines={1} color="#737373" fontWeight="light" textAlign="center">
                      {hostEvent.challenge.owner.username}
                    </Text>
                  </GridItem>
                  <GridItem colSpan={1} ml="0.1rem" overflow="hidden" justifyItems="center">
                    <Text fontFamily="Inter" fontSize="18px" noOfLines={2} color="#000000" fontWeight="100" textAlign="left">
                      {hostEvent.challenge.title}
                    </Text>
                    <Text fontFamily="Inter" fontSize="12px" noOfLines={1} color="#737373" fontWeight="light" textAlign="left" fontStyle="">
                      {hostEvent.challenge.description}
                    </Text>
                  </GridItem>
                </Grid>
                <Flex position="absolute" right="4px" bottom="0px">
                  {hostEvent.challenge.score > hostEvent.score ? (
                    <Text color="rgba(0, 159, 35, 0.4)" fontSize="36px" fontWeight="bold">
                      WINNING
                    </Text>
                  ) : (
                    <Text color="rgba(159, 0, 0, 0.4)" fontSize="36px" fontWeight="bold">
                     LOSING
                    </Text>
                  )
                  }
            </Flex>
              </>
            ) : (
              <>
                <Flex
                  width="100%"
                  justifyContent="center"
                  alignItems="center"
                  direction="column"
                  pt="2.5rem"
                  pl="0.1rem"
                  pr="0.1rem"
                >
                  <Text fontFamily="Inter" fontSize="12px" noOfLines={2} color="#707070" fontWeight="100" textAlign="center">
                    no one has challenged this host for their timeslot.
                  </Text>
                  {eventDateState(hostEvent.hostDate) === "past" || eventDateState(hostEvent.hostDate) === "live" ? (
                    <Tooltip label="you can't challenge a past or live event">
                      <span>
                        <Button fontFamily="Inter" bg="#FFA9A9" fontSize="12px" borderRadius="16px" isDisabled>Challenge</Button>
                      </span>
                    </Tooltip>
                  ) : (
                    <ChallengeModal hostEvent={hostEvent}/>
                  )}
                </Flex>
              </>
            )}
          </GridItem>
        </Grid>
        {/* <Flex
          justifyContent="space-between"
          alignItems="center"
          padding="0.25 0.3125rem"
        >
          <Text color="#787878" fontSize="14px" fontWeight={"bold"} ml="5px">
            {video.owner.username === null
              ? centerEllipses(video.owner.address, 7)
              : video.owner.username}
          </Text>
          <GridItem colSpan={1} pl="10px" fontSize="16px" fontWeight="600">
            <Tooltip label="vote to watch video">
              {accountData?.address ? (
                <span>
                  <NebulousButton
                    opacity={video.liked ? "1" : "0.5"}
                    aria-label="like"
                    onClick={submitLike}
                    disabled={buttonDisabled}
                  >
                    {video.liked === true ? (
                      <UpVoteIconSalmon boxSize={4} />
                    ) : (
                      <UpVoteIcon boxSize={4} />
                    )}
                  </NebulousButton>
                </span>
              ) : (
                <span>
                  <NebulousButton
                    opacity="0.5"
                    aria-label="like"
                    onClick={() =>
                      toast({
                        title: "Sign in first.",
                        description: "Please sign into your wallet first.",
                        status: "warning",
                        duration: 9000,
                        isClosable: true,
                        position: "top",
                      })
                    }
                    disabled={buttonDisabled}
                  >
                    {video.liked === true ? (
                      <UpVoteIconSalmon boxSize={4} />
                    ) : (
                      <UpVoteIcon boxSize={4} />
                    )}
                  </NebulousButton>
                </span>
              )}
            </Tooltip>
            {video.score}
            <Tooltip label="vote to skip video">
              {accountData?.address ? (
                <span>
                  <NebulousButton
                    opacity={video.skipped ? "1" : "0.5"}
                    aria-label="like"
                    onClick={submitSkip}
                    disabled={buttonDisabled}
                  >
                    {video.skipped === true ? (
                      <DownVoteIconSalmon boxSize={4} />
                    ) : (
                      <DownVoteIcon boxSize={4} />
                    )}
                  </NebulousButton>
                </span>
              ) : (
                <span>
                  <NebulousButton
                    opacity="0.5"
                    aria-label="like"
                    onClick={() =>
                      toast({
                        title: "Sign in first.",
                        description: "Please sign into your wallet first.",
                        status: "warning",
                        duration: 9000,
                        isClosable: true,
                        position: "top",
                      })
                    }
                    disabled={buttonDisabled}
                  >
                    {video.skipped === true ? (
                      <DownVoteIconSalmon boxSize={4} />
                    ) : (
                      <DownVoteIcon boxSize={4} />
                    )}
                  </NebulousButton>
                </span>
              )}
            </Tooltip>
          </GridItem>
        </Flex> */}
        {/* <Card>
          <Grid templateColumns="1fr 3fr" gap="0.3125rem">
            <GridItem colSpan={1} mr="10px" width="120px">
              <Image
                src={video.thumbnail}
                height="68px"
                width="120px"
                objectFit="cover"
              />
            </GridItem>
            <Flex maxW="100%" flexDir="column">
              <Tooltip label="copy video link">
                <Text
                  textColor="#2C3A50"
                  fontWeight="bold"
                  fontSize="m"
                  lineHeight="18px"
                  noOfLines={2}
                  fontFamily="Roboto, sans-serif"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://www.youtube.com/watch?v=${video.youtubeId}`
                    );
                    toast({
                      title: "Copied!",
                      description: "Video link copied to clipboard",
                      status: "success",
                      duration: 4000,
                      isClosable: true,
                    });
                  }}
                >
                  {video.title}
                </Text>
              </Tooltip>

              <Text
                mt="5px"
                noOfLines={4}
                textColor="#2C3A50"
                fontWeight="normal"
                fontSize="14px"
                lineHeight="1.2"
                fontFamily="Roboto, sans-serif"
              >
                reason: "{video.description}"
              </Text>
            </Flex>
          </Grid>
        </Card> */}
      </Flex>
    </>
  );
};

HostEventCard.fragments = {
  hostEvent: gql`
    fragment HostEventCard_hostEvent on HostEvent {
      id
      hostDate
      title
      description
      score
      owner {
        username
        FCImageUrl
      }
      challenge {
        id
        hostDate
        title
        description
        score
        owner {
          username
          FCImageUrl
        }
        liked
        disliked
      }
      liked
      disliked
      ...useLike_hostEvent
    }
    ${useLike.fragments.hostEvent}
  `,
};

export default HostEventCard;
