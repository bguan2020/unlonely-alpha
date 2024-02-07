import {
  Button,
  Flex,
  Modal,
  ModalContent,
  ModalOverlay,
  Spinner,
  Text,
} from "@chakra-ui/react";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Virtuoso } from "react-virtuoso";

import MessageBody from "./MessageBody";
import { Message, SenderStatus } from "../../constants/types/chat";
import {
  AblyChannelPromise,
  CHANGE_USER_ROLE_EVENT,
  CHAT_MESSAGE_EVENT,
} from "../../constants";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useUser } from "../../hooks/context/useUser";
import usePostUserRoleForChannel from "../../hooks/server/usePostUserRoleForChannel";

import centerEllipses from "../../utils/centerEllipses";
import { useBalance } from "wagmi";
import { NETWORKS } from "../../constants/networks";
import { isAddress } from "viem";
import { getContractFromNetwork } from "../../utils/contract";

type MessageListProps = {
  messages: Message[];
  channel: AblyChannelPromise;
  scrollRef: any;
  isAtBottomCallback: (value: boolean) => void;
  isVipChat?: boolean;
};

type MessageItemProps = {
  message: Message;
  index: number;
  handleOpen: (message: Message) => void;
};

const MessageItem = memo(({ message, handleOpen, index }: MessageItemProps) => {
  const messageText = message.data.messageText;
  const linkArray: RegExpMatchArray | null = messageText.match(
    /((https?:\/\/)|(www\.))[^\s/$.?#].[^\s]*/g
  );

  return (
    <div
      key={message.id || index}
      style={{
        padding: "2px",
      }}
    >
      <MessageBody
        index={index}
        message={message}
        messageText={messageText}
        linkArray={linkArray}
        handleOpen={handleOpen}
      />
    </div>
  );
});
const MessageList = memo(
  ({
    messages,
    channel,
    scrollRef,
    isAtBottomCallback,
    isVipChat,
  }: MessageListProps) => {
    const chatMessages = useMemo(
      () =>
        messages
          .filter((message) => message.name === CHAT_MESSAGE_EVENT)
          .filter((message) =>
            isVipChat
              ? message.data.senderStatus === SenderStatus.VIP ||
                message.data.senderStatus === SenderStatus.CHATBOT
              : true
          ),
      [messages, isVipChat]
    );

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const [selectedMessage, setSelectedMessage] = useState<Message | undefined>(
      undefined
    );

    const handleOpen = useCallback((message: Message) => {
      setSelectedMessage(message);
      setIsOpen(true);
    }, []);

    return (
      <>
        <ChatUserModal
          isOpen={isOpen}
          message={selectedMessage}
          channel={channel}
          handleClose={() => {
            setIsOpen(false);
          }}
        />
        {chatMessages.length > 0 ? (
          <Virtuoso
            followOutput={"auto"}
            ref={scrollRef}
            style={{
              height: "100%",
              overflowY: "scroll",
            }}
            className="hide-scrollbar"
            data={chatMessages}
            atBottomStateChange={(isAtBottom) => isAtBottomCallback(isAtBottom)}
            initialTopMostItemIndex={chatMessages.length - 1}
            itemContent={(index, data) => (
              <MessageItem
                key={data.id || index}
                message={data}
                handleOpen={handleOpen}
                index={index}
              />
            )}
          />
        ) : (
          <>
            <Flex flexDirection="row" flex="1">
              <Text color="white" textAlign={"center"}>
                {"No messages to show. Messages delete every 48 hrs."}
              </Text>
            </Flex>
          </>
        )}
      </>
    );
  }
);

const ChatUserModal = ({
  isOpen,
  channel,
  handleClose,
  message,
}: {
  isOpen: boolean;
  channel: AblyChannelPromise;
  handleClose: () => void;
  message?: Message;
}) => {
  const { user } = useUser();
  const { channel: c } = useChannelContext();
  const { channelQueryData, channelRoles } = c;

  const [isBanning, setIsBanning] = useState<boolean>(false);
  const [isAppointing, setIsAppointing] = useState<boolean>(false);
  const contract = getContractFromNetwork("vibesTokenV1", NETWORKS[0]);

  const { data: vibesBalance, refetch: refetchVibesBalance } = useBalance({
    address: message?.data.address as `0x${string}`,
    token: contract.address,
    enabled: false,
  });

  const { postUserRoleForChannel, loading } = usePostUserRoleForChannel({
    onError: (error) => {
      console.log(error);
    },
  });

  const userIsChannelOwner = useMemo(
    () => user?.address === channelQueryData?.owner.address,
    [user, channelQueryData]
  );

  const userIsModerator = useMemo(
    () =>
      channelRoles?.some((m) => m?.address === user?.address && m?.role === 2),
    [user, channelRoles]
  );

  const appoint = async () => {
    await postUserRoleForChannel({
      channelId: channelQueryData?.id,
      userAddress: message?.data.address,
      role: 2,
    });
    channel.publish({
      name: CHANGE_USER_ROLE_EVENT,
      data: {
        body: JSON.stringify({
          address: message?.data.address,
          role: 2,
          isAdding: true,
        }),
      },
    });
    handleClose();
  };

  const ban = async () => {
    await postUserRoleForChannel({
      channelId: channelQueryData?.id,
      userAddress: message?.data.address,
      role: 1,
    });
    channel.publish({
      name: CHANGE_USER_ROLE_EVENT,
      data: {
        body: JSON.stringify({
          address: message?.data.address,
          role: 1,
          isAdding: true,
        }),
      },
    });
    handleClose();
  };

  useEffect(() => {
    if (
      isOpen &&
      message !== undefined &&
      isAddress(message?.data.address as `0x${string}`)
    ) {
      refetchVibesBalance();
    }
  }, [message, isOpen]);

  return (
    <Modal
      isCentered
      isOpen={isOpen && message !== undefined}
      onClose={handleClose}
    >
      <ModalOverlay backgroundColor="#282828e6" />
      {message !== undefined && (
        <ModalContent
          maxW="500px"
          boxShadow="0px 8px 28px #0a061c40"
          padding="12px"
          borderRadius="5px"
          bg="#3A3A3A"
        >
          {!isBanning && !isAppointing && (
            <>
              <Text
                _hover={{ cursor: "pointer" }}
                fontSize="16px"
                color={message.data.chatColor}
                fontWeight="bold"
              >
                {message.data.username
                  ? message.data.username
                  : centerEllipses(message.data.address, 10)}
                :
              </Text>
              {message.data.address}
              {vibesBalance?.formatted !== undefined && (
                <Text color="#c6c3fc" fontWeight="bold">
                  $VIBES: {vibesBalance?.formatted}
                </Text>
              )}
              {(userIsChannelOwner || userIsModerator) &&
                message.data.address !== channelQueryData?.owner.address &&
                message.data.address !== user?.address &&
                !isBanning && (
                  <>
                    {!channelRoles?.some(
                      (m) =>
                        m?.address === message.data.address && m?.role === 2
                    ) ? (
                      <Button
                        color="white"
                        mt="20px"
                        bg="#842007"
                        _hover={{}}
                        _focus={{}}
                        _active={{}}
                        onClick={() => setIsBanning(true)}
                      >
                        ban user from chat
                      </Button>
                    ) : (
                      <Text
                        textAlign={"center"}
                        fontSize="14px"
                        color="#db9719"
                      >
                        Cannot ban this user because they are a moderator,
                        remove their status on your dashboard first
                      </Text>
                    )}
                  </>
                )}
              {userIsChannelOwner &&
                message.data.address !== user?.address &&
                !channelRoles.some(
                  (m) => m?.address === message.data.address && m?.role === 2
                ) &&
                !isAppointing && (
                  <Button
                    color="white"
                    mt="20px"
                    bg="#074a84"
                    _hover={{}}
                    _focus={{}}
                    _active={{}}
                    onClick={() => setIsAppointing(true)}
                  >
                    appoint user as chat moderator
                  </Button>
                )}
            </>
          )}
          {isBanning && (
            <>
              {!loading ? (
                <Flex direction="column" gap="10px">
                  <Text textAlign="center">
                    are you sure you want to ban this user from chatting on your
                    channel and all their chat messages?
                  </Text>
                  <Flex justifyContent={"space-evenly"}>
                    <Button
                      color="white"
                      bg="#b12805"
                      _hover={{}}
                      _focus={{}}
                      _active={{}}
                      onClick={ban}
                    >
                      yes, do it
                    </Button>
                    <Button
                      color="white"
                      opacity={"0.5"}
                      border={"1px solid white"}
                      bg={"transparent"}
                      _hover={{}}
                      _focus={{}}
                      _active={{}}
                      onClick={() => setIsBanning(false)}
                    >
                      maybe not...
                    </Button>
                  </Flex>
                </Flex>
              ) : (
                <Flex justifyContent={"center"}>
                  <Spinner size="xl" />
                </Flex>
              )}
            </>
          )}
          {isAppointing && (
            <>
              {!loading ? (
                <Flex direction="column" gap="10px">
                  <Text textAlign="center">
                    are you sure you want to make this user a chat moderator?
                  </Text>
                  <Text textAlign="center" color="#8ced15">
                    you can always remove their status through your dashboard
                  </Text>
                  <Flex justifyContent={"space-evenly"}>
                    <Button
                      color="white"
                      bg="#054db1"
                      _hover={{}}
                      _focus={{}}
                      _active={{}}
                      onClick={appoint}
                    >
                      yes, do it
                    </Button>
                    <Button
                      color="white"
                      opacity={"0.5"}
                      border={"1px solid white"}
                      bg={"transparent"}
                      _hover={{}}
                      _focus={{}}
                      _active={{}}
                      onClick={() => setIsAppointing(false)}
                    >
                      maybe not...
                    </Button>
                  </Flex>
                </Flex>
              ) : (
                <Flex justifyContent={"center"}>
                  <Spinner size="xl" />
                </Flex>
              )}
            </>
          )}
        </ModalContent>
      )}
    </Modal>
  );
};

export default MessageList;
