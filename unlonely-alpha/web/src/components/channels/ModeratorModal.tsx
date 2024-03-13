import { Box, Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { useMemo } from "react";

import { CHANGE_USER_ROLE_EVENT, AblyChannelPromise } from "../../constants";
import { useChannelContext } from "../../hooks/context/useChannel";
import useUserAgent from "../../hooks/internal/useUserAgent";
import usePostUserRoleForChannel from "../../hooks/server/channel/usePostUserRoleForChannel";
import centerEllipses from "../../utils/centerEllipses";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";

export default function ModeratorModal({
  title,
  isOpen,
  callback,
  handleClose,
  ablyChannel,
}: {
  title: string;
  isOpen: boolean;
  callback?: any;
  handleClose: () => void;
  ablyChannel: AblyChannelPromise;
}) {
  const { channel } = useChannelContext();
  const { channelQueryData, channelRoles } = channel;
  const { isStandalone } = useUserAgent();

  const { postUserRoleForChannel, loading } = usePostUserRoleForChannel({
    onError: (error) => {
      console.log(error);
    },
  });

  const moderators = useMemo(
    () => channelRoles.filter((role) => role?.role === 2),
    [channelRoles]
  );

  const undoAppointment = async (address: string) => {
    await postUserRoleForChannel({
      channelId: channelQueryData?.id,
      role: 0,
      userAddress: address,
    });

    ablyChannel?.publish({
      name: CHANGE_USER_ROLE_EVENT,
      data: {
        body: JSON.stringify({
          address,
          role: 2,
          isAdding: false,
        }),
      },
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
        <Flex direction="column" gap="5px">
          {moderators?.map((moderator, i) => (
            <Box key={i}>
              <Flex justifyContent={"space-between"} alignItems="center">
                <Text color="#9d9d9d">
                  {centerEllipses(moderator?.address, 13)}
                </Text>
                <Button
                  color="white"
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
        </Flex>
      ) : (
        <Flex justifyContent={"center"}>
          <Spinner />
        </Flex>
      )}
    </TransactionModalTemplate>
  );
}
