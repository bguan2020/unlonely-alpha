import { gql } from "@apollo/client";
import { Flex, Text, ScaleFade, Fade, Button,Box, Card, CardBody, CardHeader, Heading, Stack, StackDivider } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

import centerEllipses from "../../utils/centerEllipses";
interface Command {
    name: string;
    description: string;
    value: string;
}

type Props = {
open: boolean;
onClose: () => void;
onCommandClick: (text: string) => void;
};

const commandList: Command[] = [
    {name: "@nfc [title]",description: "Make a clip that becomes a NFT.",value: "@nfc "},
    {name: "@chatbot [question]",description: "Ask a question about the stream.",value: "@chatbot "}
]


export default function Commands({
  open,
  onClose,
  onCommandClick,
}: Props) {
    const [hydrated, setHydrated] = useState(false);
    const [currentOpen, setOpen] = useState(open);
useEffect(() => {
    setHydrated(true);
},[])
useEffect(() => { setOpen(open) }, [open]);
if(!hydrated) {
    return null
}
    if(!currentOpen) {
        return <></>
    }
  return (
    <Flex zIndex={1}  mb="80" w="75%">
  <Stack style={{background: "white"}}>
        {commandList.map((command) => {
            return( <Button onClick={() => {
             onCommandClick(command.value)
            }}><Stack><Text fontSize='xs'>{command.name}</Text> <Text fontSize='xs'>{command.description}</Text></Stack></Button>)
        })}
</Stack>      </Flex> 
    

  );
}