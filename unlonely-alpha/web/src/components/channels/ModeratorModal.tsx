import { Avatar, Box, Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { useMemo } from "react";

import { APPOINT_USER_EVENT } from "../../constants";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useUser } from "../../hooks/context/useUser";
import useUserAgent from "../../hooks/internal/useUserAgent";
import useToggleModeratorToChannel from "../../hooks/server/useToggleModerator";
import centerEllipses from "../../utils/centerEllipses";
import { anonUrl } from "../presence/AnonUrl";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";

export default function ModeratorModal({
  title,
  isOpen,
  callback,
  handleClose,
}: {
  title: string;
  isOpen: boolean;
  callback?: any;
  handleClose: () => void;
}) {
  const { userAddress, user } = useUser();
  const { channel, arcade } = useChannelContext();
  const { addToChatbot } = arcade;
  const { channelQueryData } = channel;
  const { isStandalone } = useUserAgent();

  const { toggleModeratorToChannel, loading } = useToggleModeratorToChannel({
    onError: (error) => {
      console.log(error);
    },
  });

  const moderators = useMemo(
    () => channelQueryData?.moderators,
    [channelQueryData]
  );

  const undoAppointment = async (address: string) => {
    await toggleModeratorToChannel({
      channelId: channelQueryData?.id,
      userAddress: address,
    });
    addToChatbot({
      title: null,
      username: user?.username ?? "",
      address: userAddress ?? "",
      taskType: APPOINT_USER_EVENT,
      description: address,
    });
  };

  return (
    <TransactionModalTemplate
      title={title}
      isOpen={isOpen}
      handleClose={handleClose}
      size={isStandalone ? "sm" : "md"}
      hideFooter
    >
      {!loading ? (
        <>
          {moderators?.map((moderator) => (
            <Box>
              <Flex justifyContent={"space-between"} alignItems="center">
                <Flex gap="10px">
                  <Avatar
                    name={user?.username ?? user?.address}
                    src={getImageUrl(
                      moderator?.FCImageUrl ?? moderator?.lensImageUrl
                    )}
                    size="md"
                  />
                  {user?.username ? (
                    <Flex direction="column">
                      <Text>{user?.username}</Text>
                      <Text color="#9d9d9d">
                        {centerEllipses(user?.address, 13)}
                      </Text>
                    </Flex>
                  ) : (
                    <Flex direction="column" justifyContent="center">
                      <Text color="#9d9d9d">
                        {centerEllipses(user?.address, 13)}
                      </Text>
                    </Flex>
                  )}
                </Flex>
                <Button
                  bg="#dd5555ff"
                  _hover={{}}
                  _active={{}}
                  _focus={{}}
                  onClick={() => undoAppointment(String(moderator?.address))}
                >
                  remove
                </Button>
              </Flex>
            </Box>
          ))}
          {(!moderators || moderators?.length === 0) && (
            <Text textAlign="center">
              No moderators yet, add some users from the chat to help you out!
            </Text>
          )}
        </>
      ) : (
        <Flex justifyContent={"center"}>
          <Spinner />
        </Flex>
      )}
    </TransactionModalTemplate>
  );
}

const getImageUrl = (url: string | null | undefined) => {
  const imageUrl = url ?? anonUrl;
  const ipfsUrl = imageUrl.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${imageUrl.slice(7)}`
    : imageUrl;
  return ipfsUrl;
};
