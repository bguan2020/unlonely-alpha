import { Flex, Text, Button, Stack } from "@chakra-ui/react";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { BaseChatCommand, CommandData } from "../../constants";
interface Command {
  name: string;
  description?: string;
  value: string;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onCommandClick: (text: string) => void;
  chat: string;
  additionalChatCommands?: CommandData[];
};

const commandList: Command[] = [
  {
    name: BaseChatCommand.CLIP.concat(""),
    description: "Make a clip.",
    value: BaseChatCommand.CLIP.concat(" "),
  },
  {
    name: BaseChatCommand.CHATBOT.concat(" [question]"),
    description: "Ask a question about the stream.",
    value: BaseChatCommand.CHATBOT.concat(" "),
  },
];
function useOutsideAlerter(ref: any, onClose: () => void) {
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

export default function Commands({
  open,
  onClose,
  onCommandClick,
  chat,
  additionalChatCommands,
}: Props) {
  const channelChatComands: Command[] = additionalChatCommands
    ? additionalChatCommands.map((c) => {
        return {
          name: "!".concat(c.command),
          value: "!".concat(c.command).concat(" "),
        };
      })
    : [];

  const aggregatedCommandList = [...commandList, ...channelChatComands];

  const [currentOpen, setCurrentOpen] = useState(open);

  const matchingList = useMemo(() => {
    return aggregatedCommandList.filter((command) => {
      return command.value.includes(chat);
    });
  }, [aggregatedCommandList, chat]);

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, onClose);

  useEffect(() => {
    setCurrentOpen(open);
  }, [open]);

  return (
    <>
      {currentOpen && matchingList.length > 0 && (
        <Flex ref={wrapperRef} zIndex={2} mb="20" w="75%">
          <Stack
            style={{ background: "rgb(47, 47, 100)" }}
            borderRadius="10px"
            p="5px"
          >
            {matchingList.map((command, i) => {
              return (
                <Button
                  key={i}
                  bg={"#36548f"}
                  _hover={{ bg: "#d16fce" }}
                  _active={{ bg: "#d16fce" }}
                  onClick={() => {
                    onCommandClick(command.value);
                  }}
                >
                  <Stack>
                    <Text fontSize="xs">{command.name}</Text>
                    {command.description && (
                      <Text fontSize="xs">{command.description}</Text>
                    )}
                  </Stack>
                </Button>
              );
            })}
          </Stack>
        </Flex>
      )}
    </>
  );
}
