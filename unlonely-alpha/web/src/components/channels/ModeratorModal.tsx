import { Box, Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { useMemo } from "react";

import { APPOINT_USER_EVENT } from "../../constants";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useUser } from "../../hooks/context/useUser";
import useUserAgent from "../../hooks/internal/useUserAgent";
import usePostUserRoleForChannel from "../../hooks/server/usePostUserRoleForChannel";
import centerEllipses from "../../utils/centerEllipses";
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

  const { postUserRoleForChannel, loading } = usePostUserRoleForChannel({
    onError: (error) => {
      console.log(error);
    },
  });

  const moderators = useMemo(
    () => channelQueryData?.roles?.filter((role) => role?.role === 2),
    [channelQueryData]
  );

  const undoAppointment = async (address: string) => {
    await postUserRoleForChannel({
      channelId: channelQueryData?.id,
      role: 0,
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
                <Text color="#9d9d9d">
                  {centerEllipses(moderator?.userAddress, 13)}
                </Text>
                <Button
                  bg="#dd5555ff"
                  _hover={{}}
                  _active={{}}
                  _focus={{}}
                  onClick={() =>
                    undoAppointment(String(moderator?.userAddress))
                  }
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
