import {
  Flex,
  Text,
  Image,
  Button,
  Textarea,
  FormControl,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useState } from "react";
import usePostStreamInteraction from "../../hooks/server/usePostStreamInteraction";
import {
  InteractionType as BackendInteractionType,
  PostStreamInteractionInput,
} from "../../generated/graphql";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { postStreamInteractionTextSchema } from "../../utils/validation/validation";

export const BooEventTtsComponent = () => {
  const [isEnteringMessage, setIsEnteringMessage] = useState(false);

  const { postStreamInteraction } = usePostStreamInteraction({});

  const form = useForm<PostStreamInteractionInput>({
    defaultValues: {},
    resolver: yupResolver(postStreamInteractionTextSchema),
  });

  const { register, formState, handleSubmit, watch } = form;

  const onSubmit = async (data: PostStreamInteractionInput) => {
    await postStreamInteraction({
      channelId: "3",
      interactionType: BackendInteractionType.TtsInteraction,
      text: data.text,
    });
    setIsEnteringMessage(false);
  };

  return (
    <Flex
      width="100%"
      height="100%"
      justifyContent={"center"}
      alignItems={"center"}
      onClick={() => {
        if (!isEnteringMessage) setIsEnteringMessage(true);
      }}
    >
      {!isEnteringMessage ? (
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          gap="16px"
          _hover={{
            cursor: "pointer",
            transform: "scale(1.1)",
            transition: "transform 0.2s",
          }}
          border={"1px solid #b8b8b8"}
          borderRadius={"10px"}
          padding="10px"
        >
          <Image
            src="/images/megaphone.png"
            alt="megaphone"
            width="20px"
            height="20px"
          />
          <Text textAlign={"center"} fontFamily="LoRes15" fontSize="20px">
            TTS BROADCAST MESSAGE
          </Text>
        </Flex>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="4px">
            <FormControl isInvalid={!!formState.errors.text}>
              <Textarea
                id="text"
                placeholder="Enter message to broadcast"
                {...register("text")}
              />
              <FormErrorMessage>
                {formState.errors.text?.message}
              </FormErrorMessage>
            </FormControl>
            <Button
              bg="#2562db"
              color={"white"}
              _hover={{
                transform: "scale(1.1)",
              }}
              type="submit"
            >
              Send
            </Button>
          </Flex>
        </form>
      )}
    </Flex>
  );
};
