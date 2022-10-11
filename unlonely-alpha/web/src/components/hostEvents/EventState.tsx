import { Flex, Circle, Text } from "@chakra-ui/react";
import { User } from "../../generated/graphql";

type Props = {
  eventDateState: string | undefined;
};

export default function EventState({ eventDateState }: Props) {
  console.log(eventDateState);
  return (
    <>
      {eventDateState === "past" ? (
        <>
          <Flex>
              <Circle size="14px" bg="#BCBCBC" ml="0.25rem"/>
              <Text color="#8C8C8C" fontSize="16px" fontWeight="light" ml="5px" fontFamily="Inter" >
                previous stream
              </Text>
            </Flex>
        </>
      ) : null}
      {eventDateState === "live" ? (
        <>
          <Flex>
              <Circle size="14px" bg="rgba(255, 0, 0, 0.38)" ml="0.25rem"/>
              <Text color="#FF0000" fontSize="16px" fontWeight="light" ml="5px" fontFamily="Inter" >
                  live now
              </Text>
            </Flex>
        </>
      ) : null}
      {eventDateState === "up next" ? (
        <>
          <Flex>
              <Circle size="14px" bg="rgba(253, 121, 0, 0.38)" ml="0.25rem"/>
              <Text color="#FD7900" fontSize="16px" fontWeight="light" ml="5px" fontFamily="Inter" >
                  up next
              </Text>
            </Flex>
        </>
      ) : null}
      <Flex/>
    </>
  );
}
