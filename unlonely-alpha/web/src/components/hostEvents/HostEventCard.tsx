import { Text, Grid, GridItem, Flex } from "@chakra-ui/layout";
import { Button, Image, Tooltip, useToast } from "@chakra-ui/react";
import { gql } from "@apollo/client";
import { useEffect, useState } from "react";
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
  const { like, dislike } = useLike({
    id: hostEvent.id,
    powerLvl: user?.powerUserLvl,
  });
  const { like: likeChallenge, dislike: dislikeChallenge } = useLike({
    id: hostEvent.challenge?.id,
    powerLvl: user?.powerUserLvl,
  });
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const accountData = useAccount();
  const toast = useToast();
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [votingClosed, setVotingClosed] = useState<boolean>(false);

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
    const hostEventDate = new Date(hostDate);
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

  // countdown timer for 4 hours before hostEvent.hostDate
  const countdownTimer = (hostDate: string) => {
    const hostEventDate = new Date(hostDate);
    const now = new Date();
    const fourHours = new Date(hostEventDate.getTime() + 4 * 60 * 60 * 1000);
    if (hostEventDate < fourHours) {
      const timeLeft = hostEventDate.getTime() - now.getTime();
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      return `${hours}h ${minutes}m ${seconds}s`;
    } else {
      return "voting closed!";
    }
  };

  const updateTime = () => {
    const hostEventDate = new Date(hostEvent.hostDate);
    const now = new Date();
    const fourHoursFromEvent = new Date(hostEventDate.getTime() - 4 * 60 * 60 * 1000);
    if (now < fourHoursFromEvent) {
      const timeLeft = hostEventDate.getTime() - now.getTime();
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      setDays(days);
      setHours(hours);
      setMinutes(minutes);
      setSeconds(seconds);
    } else {
      setVotingClosed(true);
    }
  };

  useEffect(() => {
    if (countdownTimer(hostEvent.hostDate) !== "voting closed!") {
      const interval = setInterval(() => {
        updateTime();
      }, 1000);
      return () => clearInterval(interval);
    } 
  }, []);

  return (
    <>
      <Flex
        direction="column"
        alignItems="left"
        w={{ base: "100%", md: "60%", lg: "60%", sm: "100%" }}
      >
        <Flex width="100%" justifyContent="space-between">
          <Text fontWeight="bold">{dateConverter(hostEvent.hostDate)}</Text>
          {!votingClosed ? (
            <Text fontWeight="light" color="black" fontSize="14px">
              {days}d {hours}h {minutes}m {seconds}s left to vote
            </Text>
          ) : (
            <Text fontWeight="bold">Voting closed!</Text>
          )}
        </Flex>
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
        <Grid
          templateColumns="1fr 1fr"
          gap="0.3125rem"
          width="100%"
          height="100%"
        >
          <GridItem colSpan={1} position="relative">
            <Flex
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <EventState eventDateState={eventDateState(hostEvent.hostDate)} />
              <Flex>
                <Tooltip label="vote on who you want to host">
                  {user?.address ? (
                    <>
                      {votingClosed ? (
                        <span>
                        <NebulousButton
                          opacity="0.5"
                          aria-label="like"
                          onClick={() =>
                            toast({
                              title: "Voting Closed.",
                              description: "You can no longer vote on this stream. Voting closes 4 hours before stream. ",
                              status: "info",
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
                      ) : (
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
                      )}
                    </>
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
                  {user?.address ? (
                    <>
                      {votingClosed ? (
                        <span>
                        <NebulousButton
                          opacity="0.5"
                          aria-label="like"
                          onClick={() =>
                            toast({
                              title: "Voting Closed.",
                              description: "You can no longer vote on this stream. Voting closes 4 hours before stream. ",
                              status: "info",
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
                      ) : (
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
                      )}
                    </>
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
            <Grid
              templateColumns="1fr 2fr"
              gap="0.1rem"
              width="100%"
              height="100%"
              mt="0.6rem"
              ml="0.6rem"
            >
              <GridItem
                colSpan={1}
                ml="0.1rem"
                overflow="hidden"
                justifyItems="center"
              >
                <Image
                  height="66px"
                  width="66px"
                  objectFit="cover"
                  src={
                    hostEvent.owner.FCImageUrl
                      ? hostEvent.owner.FCImageUrl
                      : unlonelyAvatar
                  }
                  borderRadius="full"
                  m="auto"
                />
                <Text
                  fontSize="12px"
                  noOfLines={1}
                  color="#737373"
                  fontWeight="light"
                  textAlign="center"
                >
                  {hostEvent.owner.username}
                </Text>
              </GridItem>
              <GridItem
                colSpan={1}
                ml="0.1rem"
                overflow="hidden"
                justifyItems="center"
              >
                <Text
                  fontFamily="Inter"
                  fontSize="18px"
                  noOfLines={2}
                  color="#000000"
                  fontWeight="100"
                  textAlign="left"
                >
                  {hostEvent.title}
                </Text>
                <Text
                  fontFamily="Inter"
                  fontSize="12px"
                  noOfLines={1}
                  color="#737373"
                  fontWeight="light"
                  textAlign="left"
                  fontStyle=""
                >
                  {hostEvent.description}
                </Text>
              </GridItem>
            </Grid>
            <Flex position="absolute" right="4px" bottom="0px">
              {!hostEvent.challenge ? (
                <Text
                  color="rgba(0, 159, 35, 0.4)"
                  fontSize="36px"
                  fontWeight="bold"
                >
                  WINNING
                </Text>
              ) : (
                <>
                  {hostEvent.score >= hostEvent.challenge.score ? (
                    <Text
                      color="rgba(0, 159, 35, 0.4)"
                      fontSize="36px"
                      fontWeight="bold"
                    >
                      WINNING
                    </Text>
                  ) : (
                    <Text
                      color="rgba(159, 0, 0, 0.4)"
                      fontSize="36px"
                      fontWeight="bold"
                    >
                      LOSING
                    </Text>
                  )}
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
                  <Flex />
                  <Flex>
                    <Tooltip label="vote on who you want to host">
                      {user?.address ? (
                        <>
                          {votingClosed ? (
                            <span>
                            <NebulousButton
                              opacity="0.5"
                              aria-label="like"
                              onClick={() =>
                                toast({
                                  title: "Voting Closed.",
                                  description: "You can no longer vote on this stream. Voting closes 4 hours before stream. ",
                                  status: "info",
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
                          ) : (
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
                          )}
                        </>
                      ) : (
                        <span>
                          <NebulousButton
                            opacity="0.5"
                            aria-label="like"
                            onClick={() =>
                              toast({
                                title: "Sign in first.",
                                description:
                                  "Please sign into your wallet first.",
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
                        <>
                          {votingClosed ? (
                            <span>
                            <NebulousButton
                              opacity="0.5"
                              aria-label="like"
                              onClick={() =>
                                toast({
                                  title: "Voting Closed.",
                                  description: "You can no longer vote on this stream. Voting closes 4 hours before stream. ",
                                  status: "info",
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
                          ) : (
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
                          )}
                        </>
                      ) : (
                        <span>
                          <NebulousButton
                            opacity="0.5"
                            aria-label="like"
                            onClick={() =>
                              toast({
                                title: "Sign in first.",
                                description:
                                  "Please sign into your wallet first.",
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
                <Grid
                  templateColumns="1fr 2fr"
                  gap="0.1rem"
                  width="100%"
                  height="100%"
                  mt="0.6rem"
                  ml="0.6rem"
                >
                  <GridItem
                    colSpan={1}
                    ml="0.1rem"
                    overflow="hidden"
                    justifyItems="center"
                  >
                    <Image
                      height="66px"
                      width="66px"
                      objectFit="cover"
                      src={
                        hostEvent.challenge.owner.FCImageUrl
                          ? hostEvent.challenge.owner.FCImageUrl
                          : unlonelyAvatar
                      }
                      borderRadius="full"
                      m="auto"
                    />
                    <Text
                      fontSize="12px"
                      noOfLines={1}
                      color="#737373"
                      fontWeight="light"
                      textAlign="center"
                    >
                      {hostEvent.challenge.owner.username}
                    </Text>
                  </GridItem>
                  <GridItem
                    colSpan={1}
                    ml="0.1rem"
                    overflow="hidden"
                    justifyItems="center"
                  >
                    <Text
                      fontFamily="Inter"
                      fontSize="18px"
                      noOfLines={2}
                      color="#000000"
                      fontWeight="100"
                      textAlign="left"
                    >
                      {hostEvent.challenge.title}
                    </Text>
                    <Text
                      fontFamily="Inter"
                      fontSize="12px"
                      noOfLines={1}
                      color="#737373"
                      fontWeight="light"
                      textAlign="left"
                      fontStyle=""
                    >
                      {hostEvent.challenge.description}
                    </Text>
                  </GridItem>
                </Grid>
                <Flex position="absolute" right="4px" bottom="0px">
                  {hostEvent.challenge.score > hostEvent.score ? (
                    <Text
                      color="rgba(0, 159, 35, 0.4)"
                      fontSize="36px"
                      fontWeight="bold"
                    >
                      WINNING
                    </Text>
                  ) : (
                    <Text
                      color="rgba(159, 0, 0, 0.4)"
                      fontSize="36px"
                      fontWeight="bold"
                    >
                      LOSING
                    </Text>
                  )}
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
                  <Text
                    fontFamily="Inter"
                    fontSize="12px"
                    noOfLines={2}
                    color="#707070"
                    fontWeight="100"
                    textAlign="center"
                  >
                    no one has challenged this host for their timeslot.
                  </Text>
                  {eventDateState(hostEvent.hostDate) === "past" ||
                  eventDateState(hostEvent.hostDate) === "live" ? (
                    <Tooltip label="you can't challenge a past or live event">
                      <span>
                        <Button
                          fontFamily="Inter"
                          bg="#FFA9A9"
                          fontSize="12px"
                          borderRadius="16px"
                          isDisabled
                        >
                          Challenge
                        </Button>
                      </span>
                    </Tooltip>
                  ) : (
                    <ChallengeModal hostEvent={hostEvent} />
                  )}
                </Flex>
              </>
            )}
          </GridItem>
        </Grid>
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
