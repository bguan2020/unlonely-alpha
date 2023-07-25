import { AddIcon } from "@chakra-ui/icons";
import { Button, Flex, IconButton, Input, Text, Image } from "@chakra-ui/react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { BaseChatCommand, CommandData } from "../../constants";
import { ChatCommand } from "../../generated/graphql";
import { useChannelContext } from "../../hooks/context/useChannel";
import useUpdateDeleteChatCommands from "../../hooks/server/updateDeleteChatCommands";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";

const inputStyle = {
  borderWidth: "1px",
  borderRadius: "10px",
  borderColor: "#244FA7",
  bg: "rgba(36, 79, 167, 0.05)",
  variant: "unstyled",
  px: "16px",
  py: "10px",
};

export default function ChatCommandModal({
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
  const { channel } = useChannelContext();
  const { channelBySlug } = channel;

  const [commandsData, setCommandsData] = useState<CommandData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  const { updateDeleteChatCommands, loading: updateLoading } =
    useUpdateDeleteChatCommands({});

  const isDeletingAll = useMemo(() => {
    if (
      commandsData.length === 0 &&
      channelBySlug?.chatCommands &&
      channelBySlug?.chatCommands.length > 0
    ) {
      return true;
    }
    return false;
  }, [commandsData, channelBySlug]);

  const callChange = useCallback(() => {
    updateDeleteChatCommands({
      id: channelBySlug?.id,
      chatCommands: commandsData,
    });
  }, [channelBySlug, commandsData]);

  useEffect(() => {
    if (channelBySlug?.chatCommands) {
      const nonNullCommands: ChatCommand[] = channelBySlug.chatCommands.filter(
        (c): c is ChatCommand => c !== null
      );
      setCommandsData(nonNullCommands);
    }
  }, [channelBySlug]);

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
              {...inputStyle}
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
              {...inputStyle}
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
