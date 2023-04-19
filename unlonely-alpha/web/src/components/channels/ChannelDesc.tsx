import { Text, Flex } from "@chakra-ui/layout";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState } from "react";

import {
  ChannelDetailQuery,
  UpdateChannelTextInput,
} from "../../generated/graphql";
import { EditIcon } from "../../components/icons/EditIcon";
import { updateChannelTextSchema } from "../../utils/validation/validation";
import useUpdateChannelText from "../../hooks/useUpdateChannelText";
import { Button, FormControl, FormErrorMessage, Textarea, Tooltip } from "@chakra-ui/react";

type Props = {
  channel: ChannelDetailQuery["getChannelBySlug"];
  isOwner: boolean;
};

const ChannelDesc = ({ channel, isOwner }: Props) => {
  const [editableText, setEditableText] = useState<boolean>(false);
  const [formError, setFormError] = useState<string[]>([]);
  const form = useForm<UpdateChannelTextInput>({
    defaultValues: {},
    resolver: yupResolver(updateChannelTextSchema),
  });
  const { register, formState, handleSubmit, watch } = form;
  const { updateChannelText, loading } = useUpdateChannelText({
    onError: (m) => {
      setFormError(m ? m.map((e) => e.message) : ["An unknown error occurred"]);
    },
  });
  console.log(isOwner, "isOwner");

  const onSubmit = (data: UpdateChannelTextInput) => {
    console.log(data, "data");
    console.log(channel?.id, "channel?.id");
    updateChannelText({
      id: channel?.id,
      name: data.name,
      description: data.description,
    });
    setEditableText(false);
  };

  return (
    <>
      {editableText ? (
        <>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="column">
            <Flex
  maxH="400px"
  margin="auto"
  mb="16px"
  ml="32px"
  mt="12px"
  w="60%"
  justifyContent="left"
  flexDirection="row"
  position="relative"
>
  <FormControl isInvalid={!!formState.errors.name}>
    <Textarea
      id="name"
      placeholder={
        channel?.name ? channel.name : "Enter a title for your stream."
      }
      _placeholder={{ color: "grey" }}
      lineHeight="1.2"
      background="#F1F4F8"
      borderRadius="10px"
      boxShadow="#F1F4F8"
      minHeight="3.4rem"
      color="#2C3A50"
      fontWeight="medium"
      fontSize="2rem"
      w="100%"
      padding="auto"
      {...register("name")}
    />
    <FormErrorMessage>{formState.errors.name?.message}</FormErrorMessage>
  </FormControl>
  {isOwner && (
    <EditIcon
      boxSize={5}
      position="absolute"
      right="-1.4rem"
      top="15%"
      transform="translateY(-50%)"
      onClick={() => {
        setEditableText((prevEditableText) => !prevEditableText);
      }}
    />
  )}
</Flex>
              <Flex direction="row" width="60%" margin="auto" ml="32px">
                <FormControl isInvalid={!!formState.errors.description}>
                  <Textarea
                    id="description"
                    placeholder={
                      channel?.description
                        ? channel.description
                        : "Enter a description for your channel"
                    }
                    _placeholder={{ color: "grey" }}
                    lineHeight="1.2"
                    background="#F1F4F8"
                    borderRadius="10px"
                    boxShadow="#F1F4F8"
                    minHeight="4rem"
                    color="#2C3A50"
                    fontWeight="medium"
                    w="100%"
                    padding="auto"
                    {...register("description")}
                  />
                  <FormErrorMessage>
                    {formState.errors.description?.message}
                  </FormErrorMessage>
                </FormControl>
              </Flex>
              <Flex width="60%" flexDirection="row-reverse" ml="32px">
                <Button
                  bg="#FFCC15"
                  _hover={loading ? {} : { bg: "black" }}
                  type="submit"
                  isLoading={loading}
                  mt="2rem"
                  mb="2rem"
                >
                  Submit
                </Button>
              </Flex>
            </Flex>
          </form>
        </>
      ) : (
        <>
          <Flex direction="column">
            <Flex
              maxH="400px"
              margin="auto"
              mb="16px"
              ml="32px"
              w="100%"
              justifyContent="left"
              pr="32px"
              flexDirection="row"
            >
              <Text fontSize="2rem" fontWeight="bold">
                {channel?.name}
              </Text>
              {isOwner && (
                <Tooltip label={"edit title/description"}>
                  <EditIcon
                    boxSize={5}
                    cursor="pointer"
                    onClick={() => {
                      setEditableText((prevEditableText) => !prevEditableText);
                    }}
                  />
                </Tooltip>
              )}
            </Flex>
            <Flex direction="row" width="100%" margin="auto" ml="32px">
              {channel?.description}
            </Flex>
          </Flex>
        </>
      )}
    </>
  );
};

export default ChannelDesc;
