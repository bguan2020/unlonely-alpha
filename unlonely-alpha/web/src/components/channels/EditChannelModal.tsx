import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Textarea,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { UpdateChannelTextInput } from "../../generated/graphql";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useUser } from "../../hooks/context/useUser";
import useUpdateChannelText from "../../hooks/server/useUpdateChannelText";
import { updateChannelTextSchema } from "../../utils/validation/validation";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";

export default function EditChannelModal({
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
  const { user } = useUser();
  const { channel } = useChannelContext();
  const { channelBySlug } = channel;

  const [formError, setFormError] = useState<string[]>([]);
  // const [tokenSaleModal, setTokenSaleModal] = useState<boolean>(false);
  // const [chatCommandModal, setChatCommandModal] = useState<boolean>(false);
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

  const onSubmit = (data: UpdateChannelTextInput) => {
    updateChannelText({
      id: channelBySlug?.id,
      name: data.name,
      description: data.description,
    });
    handleClose();
  };

  return (
    <TransactionModalTemplate
      title={title}
      confirmButton={"confirm"}
      isOpen={isOpen}
      isModalLoading={loading}
      handleClose={handleClose}
      hideFooter
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" gap="16px">
          <Flex
            maxH="400px"
            margin="auto"
            flexDirection="row"
            position="relative"
          >
            <FormControl isInvalid={!!formState.errors.name}>
              <Textarea
                id="name"
                placeholder={
                  channelBySlug?.name
                    ? channelBySlug.name
                    : "Enter a title for your stream."
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
              <FormErrorMessage>
                {formState.errors.name?.message}
              </FormErrorMessage>
            </FormControl>
          </Flex>
          <Flex direction="row" justifyContent={"center"}>
            <FormControl isInvalid={!!formState.errors.description}>
              <Textarea
                id="description"
                placeholder={
                  channelBySlug?.description
                    ? channelBySlug.description
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
          <Flex>
            <Button
              bg="#E09025"
              _hover={{}}
              _focus={{}}
              _active={{}}
              width="100%"
              type="submit"
            >
              Submit
            </Button>
          </Flex>
        </Flex>
      </form>
    </TransactionModalTemplate>
  );
}