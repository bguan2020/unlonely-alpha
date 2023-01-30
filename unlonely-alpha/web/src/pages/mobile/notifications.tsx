import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Image,
  Input,
  Progress,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import NextHead from "../../components/layout/NextHead";

type UserNotificationsType = {
  username: string;
  address: string;
  notificationsTokens: string;
  notificationsLive: boolean;
  notificationsNFCs: boolean;
};

const GET_ALL_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      username
      address
      notificationsTokens
      notificationsLive
      notificationsNFCs
    }
  }
`;

export default function MobileNotifications() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const [isSending, setIsSending] = useState(false);
  const [selectedType, setSelectedType] = useState("live");
  const placeholderTitleLive = "🔴 brian is live on unlonely!";
  const placeholderBodyLive = "join the stream and hang out";
  const placeholderTitleNFCs = "new NFCs just dropped";
  const placeholderBodyNFCs = "watch some highlights from recent streams";
  const [titleLive, setTitleLive] = useState(placeholderTitleLive);
  const [titleNFCs, setTitleNFCs] = useState(placeholderTitleNFCs);
  const [bodyLive, setBodyLive] = useState(placeholderBodyLive);
  const [bodyNFCs, setBodyNFCs] = useState(placeholderBodyNFCs);
  const [getAllUsers, { loading, data }] = useLazyQuery(GET_ALL_USERS, {
    fetchPolicy: "no-cache",
  });
  const users = data?.getAllUsers;
  const usersWithTokens = users?.filter((user: UserNotificationsType) => {
    if (user.notificationsTokens !== "") {
      const tokens = JSON.parse(user.notificationsTokens);
      const filtered = tokens.filter(
        (token: string | undefined) => token !== null
      );

      if (filtered.length === 0) return;

      return user;
    }
  });
  const usersWithLive = users?.filter((user: UserNotificationsType) => {
    if (user.notificationsLive) return user;
  });
  const usersWithNFCs = users?.filter((user: UserNotificationsType) => {
    if (user.notificationsNFCs) return user;
  });

  const sendNotifications = async () => {
    setTimeout(() => {
      onClose();
      setIsSending(false);
    }, 3000);
  };

  return (
    <Flex direction={"column"} alignItems="center">
      <NextHead
        title="Push Notifications"
        description="send em"
        image=""
      ></NextHead>
      <Flex padding={[4, 16]} justifyContent="center" maxW="1200px" w={"100%"}>
        <Stack
          direction={["column", "row"]}
          spacing="24px"
          alignItems="flex-start"
          w={"100%"}
        >
          <Box borderWidth="1px" padding="16px" w={["100%", "60%"]}>
            {!loading && data ? (
              <>
                <Flex direction="row" justifyContent="space-between" pb="4px">
                  <p>users w/ notifications on</p>
                  <Text pl="24px">{usersWithTokens?.length}</Text>
                </Flex>
                <Divider></Divider>
                <Flex direction="row" justifyContent="space-between" pb="4px">
                  <p>going live</p>
                  <Text pl="24px">{usersWithLive?.length}</Text>
                </Flex>
                <Divider></Divider>
                <Flex direction="row" justifyContent="space-between" pb="4px">
                  <p>new NFCs</p>
                  <Text pl="24px">{usersWithNFCs?.length}</Text>
                </Flex>

                <Accordion>
                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box as="span" flex="1" textAlign="left">
                          show all users and their tokens
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      {usersWithTokens?.map((user: UserNotificationsType) => {
                        return (
                          <Box marginBottom={8}>
                            <Flex>
                              <Text fontSize="lg" fontWeight={"bold"}>
                                {user.username}
                              </Text>
                            </Flex>
                            <Flex>
                              <Text fontSize={"xs"}>{user.address}</Text>
                            </Flex>
                            <Flex direction="column">
                              {JSON.parse(user?.notificationsTokens).map(
                                (token: string) => {
                                  if (token === null) return;

                                  return (
                                    <Box mb="4px" w={"100%"}>
                                      <Textarea
                                        onClick={(event) => {
                                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                          // @ts-ignore
                                          event.target.select();
                                        }}
                                        resize="none"
                                        padding={"8px"}
                                        color="gray.500"
                                        rows={1}
                                        style={{
                                          display: "block",
                                          width: "100%",
                                          fontSize: "12px",
                                        }}
                                      >
                                        {token}
                                      </Textarea>
                                    </Box>
                                  );
                                }
                              )}
                            </Flex>
                          </Box>
                        );
                      })}
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </>
            ) : (
              <Button
                onClick={() => {
                  getAllUsers();
                }}
                isLoading={loading}
                loadingText="fetching users"
                disabled={loading || isSending}
              >
                fetch users
              </Button>
            )}
            {loading && (
              <Progress
                size="sm"
                isIndeterminate
                width="300px"
                height="6px"
                borderRadius="32px"
                mt={"48px"}
              />
            )}
          </Box>
          <Box w={"100%"} position="sticky" display={"block"} top="32px">
            <Box borderWidth="1px" bg="white" padding="32px" w={"100%"}>
              <Heading size="md" paddingBottom="16px">
                send notification
              </Heading>
              <Tabs
                variant="soft-rounded"
                colorScheme="green"
                defaultIndex={0}
                onChange={(index) => {
                  if (index === 0) {
                    setSelectedType("live");
                  } else {
                    setSelectedType("nfcs");
                  }
                }}
              >
                <TabList>
                  <Tab>going live</Tab>
                  <Tab>new NFCs</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel padding={0} pt={3}>
                    <Input
                      mb={2}
                      color="gray.500"
                      value={titleLive}
                      onChange={(event) => setTitleLive(event.target.value)}
                    />
                    <Input
                      value={bodyLive}
                      color="gray.500"
                      onChange={(event) => setBodyLive(event.target.value)}
                    />
                  </TabPanel>
                  <TabPanel padding={0} pt={3}>
                    <Input
                      value={titleNFCs}
                      mb={2}
                      color="gray.500"
                      onChange={(event) => setTitleNFCs(event.target.value)}
                    />
                    <Input
                      value={bodyNFCs}
                      color="gray.500"
                      onChange={(event) => setBodyNFCs(event.target.value)}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
              <Button
                onClick={() => {
                  getAllUsers();
                }}
                isLoading={loading}
                loadingText=""
                colorScheme={"gray"}
                mt={3}
                mr={3}
                disabled={!data || loading || isSending}
              >
                refetch user list
              </Button>
              <Button
                onClick={onOpen}
                isLoading={loading}
                loadingText="fetching users"
                colorScheme={"blue"}
                mt={3}
                disabled={!data || loading || isSending}
              >
                send to{" "}
                {selectedType === "live"
                  ? usersWithLive?.length
                  : usersWithNFCs?.length}{" "}
                users
              </Button>
            </Box>
            <Text pb={5} pt={5} textAlign="center">
              preview
            </Text>
            <Flex justifyContent={"center"}>
              <PreviewNotification
                selectedType={selectedType}
                titleLive={titleLive}
                titleNFCs={titleNFCs}
                bodyLive={bodyLive}
                bodyNFCs={bodyNFCs}
              />
            </Flex>
          </Box>
        </Stack>
      </Flex>
      <AlertDialog
        motionPreset="slideInBottom"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>send notifications</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            are you sure you wanna blast all these{" "}
            {selectedType === "live"
              ? usersWithLive?.length
              : usersWithNFCs?.length}{" "}
            users with a push notification?
            <Box h={4}></Box>
            <PreviewNotification
              selectedType={selectedType}
              titleLive={titleLive}
              titleNFCs={titleNFCs}
              bodyLive={bodyLive}
              bodyNFCs={bodyNFCs}
            />
            {isSending && (
              <Box pt={5}>
                <Progress
                  size="sm"
                  isIndeterminate
                  width="100%"
                  height="6px"
                  borderRadius="32px"
                />
                <Text fontSize="sm" color="red">
                  sending. do not close this window!
                </Text>
              </Box>
            )}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ref={cancelRef}
              onClick={onClose}
              disabled={isSending}
            >
              cancel
            </Button>
            <Button
              colorScheme="red"
              ml={3}
              onClick={() => {
                setIsSending(true);
                sendNotifications();
              }}
              disabled={isSending}
              isLoading={isSending}
              loadingText="sending..."
            >
              fully send it
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Flex>
  );
}

const PreviewNotification = ({
  selectedType,
  titleLive,
  titleNFCs,
  bodyLive,
  bodyNFCs,
}: {
  selectedType: string;
  titleLive: string;
  titleNFCs: string;
  bodyLive: string;
  bodyNFCs: string;
}) => (
  <Box
    backdropBlur={"6px"}
    backgroundColor="rgba(0,0,0,0.8)"
    padding="16px"
    borderRadius={"26px"}
    width={["100%", "390px"]}
  >
    <Flex alignItems={"center"}>
      <Image
        src="https://imgur.com/RiQqM30.png"
        w="40px"
        borderRadius={"10px"}
      ></Image>
      <Box pl={3} w="100%">
        <Flex justifyContent={"space-between"} w="100%">
          <Text
            fontSize="md"
            color="gray.500"
            fontWeight={"bold"}
            fontFamily="system-ui"
            lineHeight={1.2}
            noOfLines={1}
          >
            {selectedType === "live" ? titleLive : titleNFCs}
          </Text>
          <Text
            fontSize="md"
            color="gray.700"
            fontFamily="system-ui"
            lineHeight={1.2}
            textAlign={"right"}
            pl="30px"
          >
            now
          </Text>
        </Flex>
        <Text
          fontSize="md"
          color="gray.500"
          fontFamily="system-ui"
          lineHeight={1.2}
          noOfLines={4}
          pt={"2px"}
          pr={
            bodyLive.length > 75
              ? "56px"
              : "0px" || bodyNFCs.length > 75
              ? "56px"
              : "0px"
          }
        >
          {selectedType === "live" ? bodyLive : bodyNFCs}
        </Text>
      </Box>
    </Flex>
  </Box>
);
