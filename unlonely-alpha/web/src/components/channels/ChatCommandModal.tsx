import { AddIcon } from "@chakra-ui/icons";
import { Button, Flex, IconButton, Input, Text, Image } from "@chakra-ui/react";
import { useState, useEffect, useCallback, useMemo } from "react";

import {
  AblyChannelPromise,
  BaseChatCommand,
  CHANGE_CHANNEL_DETAILS_EVENT,
  CommandData,
} from "../../constants";
import { ChatCommand } from "../../generated/graphql";
import { useChannelContext } from "../../hooks/context/useChannel";
import useUserAgent from "../../hooks/internal/useUserAgent";
import useUpdateDeleteChatCommands from "../../hooks/server/updateDeleteChatCommands";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";

export default function ChatCommandModal({
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
  const { channelQueryData, channelDetails } = channel;
  const { isStandalone } = useUserAgent();

  const [commandsData, setCommandsData] = useState<CommandData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  const { updateDeleteChatCommands, loading: updateLoading } =
    useUpdateDeleteChatCommands({});

  const isDeletingAll = useMemo(() => {
    if (
      commandsData.length === 0 &&
      channelDetails?.chatCommands &&
      channelDetails?.chatCommands.length > 0
    ) {
      return true;
    }
    return false;
  }, [commandsData, channelDetails]);

  const callChange = useCallback(async () => {
    await updateDeleteChatCommands({
      id: channelQueryData?.id,
      chatCommands: commandsData,
    });
    ablyChannel?.publish({
      name: CHANGE_CHANNEL_DETAILS_EVENT,
      data: {
        body: JSON.stringify({
          channelName: channelDetails.channelName,
          channelDescription: channelDetails.channelDescription,
          chatCommands: commandsData,
        }),
      },
    });
    handleClose();
  }, [channelQueryData, commandsData]);

  useEffect(() => {
    if (channelDetails?.chatCommands) {
      const nonNullCommands: ChatCommand[] = channelDetails.chatCommands.filter(
        (c): c is ChatCommand => c !== null
      );
      setCommandsData(nonNullCommands);
    }
  }, [channelDetails]);

  const updateCommands = (c: CommandData, i: number) => {
    const newCommands = [...commandsData];
    newCommands[i] = c;
    setCommandsData(newCommands);
  };

  const deleteCommand = (i: number) => {
    const newCommands = [...commandsData];
    newCommands.splice(i, 1);
    setCommandsData(newCommands);
  };

  const addCommand = () => {
    const newCommands = [...commandsData];
    newCommands.push({ command: "", response: "" });
    setCommandsData(newCommands);
  };

  const canSend = useMemo(() => {
    if (commandsData.length > 0) {
      for (const c of commandsData) {
        if (c.command === "" || c.response === "") {
          return false;
        }
      }
    }
    return true;
  }, [commandsData]);

  useEffect(() => {
    for (const c of commandsData) {
      if (
        Object.values(BaseChatCommand).includes(
          `!${c.command}` as BaseChatCommand
        )
      ) {
        setErrorMessage("one of your command names is already reserved");
        return;
      }
    }
    setErrorMessage(undefined);
  }, [commandsData]);

  return (
    <TransactionModalTemplate
      title={title}
      confirmButton={"confirm changes"}
      isOpen={isOpen}
      handleClose={handleClose}
      isModalLoading={updateLoading}
      loadingText={"updating commands..."}
      onSend={callChange}
      canSend={canSend && !errorMessage}
      hideFooter={commandsData.length === 0 && !isDeletingAll}
      size={isStandalone ? "sm" : "md"}
    >
      <Flex direction={"column"} gap="16px">
        <Text textAlign={"center"} fontSize="20px" color="#BABABA">
          add up to 5 chat commands
        </Text>
        {commandsData.length > 0 && (
          <Flex justifyContent={"space-around"}>
            <Text>![command]</Text>
            <Text>response</Text>
          </Flex>
        )}
        {commandsData.length === 0 && (
          <>
            <Button
              color="white"
              bg={"#36548f"}
              _hover={{
                transform: "scale(1.05)",
              }}
              _active={{ transform: "scale(1)" }}
              _focus={{}}
              onClick={addCommand}
            >
              add command
            </Button>
          </>
        )}
        {commandsData.map((c, i) => (
          <Flex justifyContent={"space-around"} gap="10px" key={i}>
            <Input
              variant="glow"
              placeholder={"command"}
              value={`!${c.command}`}
              isInvalid={Object.values(BaseChatCommand).includes(
                `!${c.command}` as BaseChatCommand
              )}
              onChange={(e) =>
                updateCommands({ ...c, command: e.target.value.slice(1) }, i)
              }
            />
            <Input
              variant="glow"
              placeholder={"response"}
              value={c.response}
              onChange={(e) =>
                updateCommands({ ...c, response: e.target.value }, i)
              }
            />
            <IconButton
              aria-label="close"
              _hover={{}}
              _active={{}}
              _focus={{}}
              bg="transparent"
              icon={<Image alt="close" src="/svg/close.svg" width="20px" />}
              onClick={() => deleteCommand(i)}
            />
          </Flex>
        ))}
        {commandsData.length > 0 && commandsData.length < 5 && (
          <Button
            color="white"
            aria-label="add-chat-command"
            onClick={addCommand}
            height="12px"
            width="12px"
            padding={"10px"}
            minWidth={"0px"}
            bg={"#C6C0C0"}
            _hover={{}}
            _active={{}}
            _focus={{}}
          >
            <AddIcon height="12px" width="12px" color={"white"} />
          </Button>
        )}
        {errorMessage && (
          <Text textAlign={"center"} color="red.400">
            {errorMessage}
          </Text>
        )}
      </Flex>
    </TransactionModalTemplate>
  );
}
