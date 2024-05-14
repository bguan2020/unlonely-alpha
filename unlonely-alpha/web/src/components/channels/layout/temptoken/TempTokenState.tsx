import { Flex } from "@chakra-ui/react";
import { ChatReturnType } from "../../../../hooks/chat/useChat";
import { useChannelContext } from "../../../../hooks/context/useChannel";
import { useTempTokenContext } from "../../../../hooks/context/useTempToken";
import { useUser } from "../../../../hooks/context/useUser";
import { TempTokenInterface } from "../../temp/TempTokenInterface";
import { CreateTokenInterface } from "./CreateTempTokenInterface";

export const TempTokenState = ({ chat }: { chat: ChatReturnType }) => {
  const { walletIsConnected } = useUser();
  const { channel } = useChannelContext();
  const { tempToken } = useTempTokenContext();
  const { isOwner } = channel;
  const { currentActiveTokenEndTimestamp } = tempToken;

  return (
    <>
      {currentActiveTokenEndTimestamp ? (
        <TempTokenInterface ablyChannel={chat.channel} customHeight="30%" />
      ) : isOwner && walletIsConnected ? (
        <Flex
          gap="5px"
          justifyContent={"center"}
          alignItems={"center"}
          bg="#131323"
          p="5px"
          height="20vh"
        >
          <CreateTokenInterface />
        </Flex>
      ) : null}
    </>
  );
};
