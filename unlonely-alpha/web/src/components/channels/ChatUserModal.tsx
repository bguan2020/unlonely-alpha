import {
  Modal,
  ModalOverlay,
  ModalContent,
  Button,
  Flex,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useState, useMemo, useEffect } from "react";
import { AblyChannelPromise, CHANGE_USER_ROLE_EVENT } from "../../constants";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useNetworkContext } from "../../hooks/context/useNetwork";
import { useUser } from "../../hooks/context/useUser";
import usePostUserRoleForChannel from "../../hooks/server/channel/usePostUserRoleForChannel";
import centerEllipses from "../../utils/centerEllipses";
import Link from "next/link";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { SelectedUser } from "../../constants/types/chat";
import { CreateUsernameInterface } from "./layout/CreateUsernameInterface";

export const ChatUserModal = ({
  isOpen,
  channel,
  handleClose,
  targetUser,
}: {
  isOpen: boolean;
  channel: AblyChannelPromise;
  handleClose: () => void;
  targetUser?: SelectedUser;
}) => {
  const { user, solanaAddress } = useUser();
  const { channel: c } = useChannelContext();
  const { channelQueryData, channelRoles } = c;
  const { network } = useNetworkContext();
  const { explorerUrl } = network;

  const [modalState, setModalState] = useState<
    | "normal"
    | "banning"
    | "appointing"
    | "removingModerator"
    | "creatingUsername"
  >("normal");

  const { postUserRoleForChannel, loading } = usePostUserRoleForChannel({
    onError: (error) => {
      console.log(error);
    },
  });

  const userIsChannelOwner = useMemo(
    () => user?.address === channelQueryData?.owner?.address,
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
      userAddress: targetUser?.address,
      role: 2,
    });
    channel.publish({
      name: CHANGE_USER_ROLE_EVENT,
      data: {
        body: JSON.stringify({
          address: targetUser?.address,
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
      userAddress: targetUser?.address,
      role: 1,
    });
    channel.publish({
      name: CHANGE_USER_ROLE_EVENT,
      data: {
        body: JSON.stringify({
          address: targetUser?.address,
          role: 1,
          isAdding: true,
        }),
      },
    });
    handleClose();
  };

  const removeAsModerator = async () => {
    await postUserRoleForChannel({
      channelId: channelQueryData?.id,
      userAddress: targetUser?.address,
      role: 2,
    });
    channel.publish({
      name: CHANGE_USER_ROLE_EVENT,
      data: {
        body: JSON.stringify({
          address: targetUser?.address,
          role: 2,
          isAdding: false,
        }),
      },
    });
    handleClose();
  };

  useEffect(() => {
    if (!isOpen) setModalState("normal");
  }, [isOpen]);

  return (
    <Modal
      isCentered
      isOpen={isOpen && targetUser !== undefined}
      onClose={handleClose}
      size="sm"
    >
      <ModalOverlay backgroundColor="#0e0332e6" />
      {targetUser !== undefined && (
        <ModalContent
          maxW="500px"
          boxShadow="0px 8px 28px #0a061c40"
          padding="12px"
          borderRadius="5px"
          bg="#281b5a"
        >
          {modalState === "normal" && (
            <Flex direction="column" gap="10px">
              <Text
                _hover={{ cursor: "pointer" }}
                fontSize="16px"
                fontWeight="bold"
              >
                {targetUser.username
                  ? targetUser.username
                  : centerEllipses(targetUser.address, 10)}
                :
              </Text>
              <Link
                target="_blank"
                href={`${explorerUrl}/address/${
                  targetUser.address ? targetUser.address : ""
                }`}
                passHref
              >
                <Flex
                  alignItems={"center"}
                  gap="2px"
                  border={"1px #5590ff solid"}
                  borderRadius="15px"
                  justifyContent={"center"}
                >
                  <Text color="#c7dbff" fontSize="13px" noOfLines={1}>
                    {targetUser.address}
                  </Text>
                  <ExternalLinkIcon />
                </Flex>
              </Link>
              {targetUser.FCHandle && (
                <Link
                  target="_blank"
                  href={`https://warpcast.com//${targetUser.FCHandle}`}
                  passHref
                >
                  <Flex
                    alignItems={"center"}
                    gap="2px"
                    border={"1px #7c65c1 solid"}
                    borderRadius="15px"
                    justifyContent={"center"}
                  >
                    <Text color="#c7dbff" fontSize="13px" noOfLines={1}>
                      {targetUser.FCHandle}
                    </Text>
                    <ExternalLinkIcon />
                  </Flex>
                </Link>
              )}
              <Flex direction="column" gap="10px">
                {userIsChannelOwner &&
                  targetUser.address !== user?.address &&
                  !channelRoles.some(
                    (m) => m?.address === targetUser.address && m?.role === 2
                  ) && (
                    <Button
                      color="white"
                      bg="#074a84"
                      _hover={{}}
                      _focus={{}}
                      _active={{}}
                      onClick={() => setModalState("appointing")}
                    >
                      appoint user as chat moderator
                    </Button>
                  )}
                {userIsChannelOwner &&
                  targetUser.address !== user?.address &&
                  channelRoles.some(
                    (m) => m?.address === targetUser.address && m?.role === 2
                  ) && (
                    <Button
                      color="white"
                      bg="#dc5d0e"
                      _hover={{}}
                      _focus={{}}
                      _active={{}}
                      onClick={() => setModalState("removingModerator")}
                    >
                      remove user as chat moderator
                    </Button>
                  )}
                {(userIsChannelOwner || userIsModerator) &&
                  targetUser.address !== channelQueryData?.owner?.address &&
                  targetUser.address !== user?.address && (
                    <>
                      {!channelRoles?.some(
                        (m) =>
                          m?.address === targetUser.address && m?.role === 2
                      ) ? (
                        <Button
                          color="white"
                          bg="#842007"
                          _hover={{}}
                          _focus={{}}
                          _active={{}}
                          onClick={() => setModalState("banning")}
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
                          remove their status first
                        </Text>
                      )}
                    </>
                  )}
              </Flex>
              {solanaAddress && !user?.username && (
                <Button onClick={() => setModalState("creatingUsername")}>
                  Create Username
                </Button>
              )}
            </Flex>
          )}
          {modalState === "banning" && (
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
                      onClick={() => setModalState("normal")}
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
          {modalState === "appointing" && (
            <>
              {!loading ? (
                <Flex direction="column" gap="10px">
                  <Text textAlign="center">
                    are you sure you want to make this user a chat moderator?
                  </Text>
                  <Text textAlign="center" color="#8ced15">
                    you can always remove their status through the chat
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
                      onClick={() => setModalState("normal")}
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
          {modalState === "removingModerator" && (
            <>
              {!loading ? (
                <Flex direction="column" gap="10px">
                  <Text textAlign="center">
                    are you sure you want to remove this user as a chat
                    moderator?
                  </Text>
                  <Flex justifyContent={"space-evenly"}>
                    <Button
                      color="white"
                      bg="#054db1"
                      _hover={{}}
                      _focus={{}}
                      _active={{}}
                      onClick={removeAsModerator}
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
                      onClick={() => setModalState("normal")}
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
          {modalState === "creatingUsername" && (
            <CreateUsernameInterface handleClose={handleClose} />
          )}
        </ModalContent>
      )}
    </Modal>
  );
};
