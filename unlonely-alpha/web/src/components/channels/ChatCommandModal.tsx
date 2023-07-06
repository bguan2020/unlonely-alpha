import { AddIcon } from "@chakra-ui/icons";
import { Button, Flex, IconButton, Input, Text, Image } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useChannelContext } from "../../hooks/context/useChannel";
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

type CommandData = {
  command: string;
  response: string;
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

  return (
    <TransactionModalTemplate
      title={title}
      confirmButton={"confirm"}
      isOpen={isOpen}
      handleClose={handleClose}
      isModalLoading={false}
    >
      <Flex direction={"column"} gap="16px">
        <Flex justifyContent={"space-around"}>
          <Text>command</Text>
          <Text>response</Text>
        </Flex>
        {commandsData.map((c, i) => (
          <Flex justifyContent={"space-around"} gap="10px">
            <Input
              {...inputStyle}
              placeholder={"command"}
              value={c.command}
              onChange={(e) =>
                updateCommands({ ...c, command: e.target.value }, i)
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
      </Flex>
    </TransactionModalTemplate>
  );
}
