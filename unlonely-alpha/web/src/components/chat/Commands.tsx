import { Flex, Text, Button, Stack } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
interface Command {
  name: string;
  description: string;
  value: string;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onCommandClick: (text: string) => void;
  chat: string;
};

const commandList: Command[] = [
  {
    name: "@nfc [title]",
    description: "Make a clip that becomes a NFT.",
    value: "@nfc ",
  },
  {
    name: "@chatbot [question]",
    description: "Ask a question about the stream.",
    value: "@chatbot ",
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
}: Props) {
  const [currentOpen, setCurrentOpen] = useState(open);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, onClose);

  useEffect(() => {
    setCurrentOpen(open);
  }, [open]);

  return (
    <>
      {currentOpen && (
        <Flex ref={wrapperRef} zIndex={1} mb="20" w="75%">
          <Stack
            style={{ background: "rgb(47, 47, 100)" }}
            borderRadius="10px"
            p="5px"
          >
            {commandList
              .filter((command) => {
                return command.value.includes(chat);
              })
              .map((command) => {
                return (
                  <Button
                    bg={"#36548f"}
                    _hover={{ bg: "#d16fce" }}
                    _active={{ bg: "#d16fce" }}
                    onClick={() => {
                      onCommandClick(command.value);
                    }}
                  >
                    <Stack>
                      <Text fontSize="xs">{command.name}</Text>{" "}
                      <Text fontSize="xs">{command.description}</Text>
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
