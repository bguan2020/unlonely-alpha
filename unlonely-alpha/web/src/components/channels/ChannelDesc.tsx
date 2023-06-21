import { Text, Flex } from "@chakra-ui/layout";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState } from "react";

import {
  ChannelDetailQuery,
  UpdateChannelTextInput,
  User,
} from "../../generated/graphql";
import { EditIcon } from "../icons/EditIcon";
import { updateChannelTextSchema } from "../../utils/validation/validation";
import useUpdateChannelText from "../../hooks/useUpdateChannelText";
import {
  Button,
  FormControl,
  FormErrorMessage,
  Textarea,
  Tooltip,
  Avatar,
} from "@chakra-ui/react";
import { anonUrl } from "../presence/AnonUrl";
import { PickCoinIcon } from "../icons/PickCoinIcon";
import TokenSaleModal from "./TokenSaleModal";
import { FetchBalanceResult } from "../../constants/types";
import { isAddress } from "viem";

type Props = {
  channel: ChannelDetailQuery["getChannelBySlug"];
  tokenContractAddress: string;
  tokenBalanceData?: FetchBalanceResult;
  user?: User;
};

const ChannelDesc = ({
  channel,
  user,
  tokenBalanceData,
  tokenContractAddress,
}: Props) => {
  const [editableText, setEditableText] = useState<boolean>(false);
  const [formError, setFormError] = useState<string[]>([]);
  const [tokenSaleModal, setTokenSaleModal] = useState<boolean>(false);
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
      id: channel?.id,
      name: data.name,
      description: data.description,
    });
    setEditableText(false);
  };

  const isOwner = user?.address === channel?.owner.address;

  const imageUrl = channel?.owner?.FCImageUrl
    ? channel?.owner.FCImageUrl
    : channel?.owner?.lensImageUrl
    ? channel?.owner.lensImageUrl
    : anonUrl;
  const ipfsUrl = imageUrl.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${imageUrl.slice(7)}`
    : imageUrl;

  return (
    <>
      <TokenSaleModal
        title={"offer tokens for sale"}
        isOpen={tokenSaleModal}
        tokenContractAddress={tokenContractAddress}
        tokenOwner={user?.address ?? ""}
        tokenBalanceData={tokenBalanceData}
        handleClose={() => setTokenSaleModal(false)}
      />
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
                      channel?.name
                        ? channel.name
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
        <Flex direction="row">
          <Avatar
            name={
              channel?.owner.username
                ? channel?.owner.username
                : channel?.owner.address
            }
            src={ipfsUrl}
            size="md"
          />
          <Flex direction="column" gap={["0px", "16px"]} width="100%">
            <Flex
              maxH="400px"
              margin="auto"
              ml="32px"
              justifyContent="left"
              pr="32px"
              flexDirection="row"
              alignItems={"baseline"}
              gap="1rem"
              wordBreak={"break-all"}
            >
              <Text
                fontSize={["1rem", "1.5rem", "2rem"]}
                fontWeight="bold"
                noOfLines={2}
              >
                {channel?.name}
              </Text>
              {isOwner && (
                <>
                  <Tooltip label={"edit title/description"}>
                    <EditIcon
                      boxSize={5}
                      cursor="pointer"
                      onClick={() => {
                        setEditableText(
                          (prevEditableText) => !prevEditableText
                        );
                      }}
                    />
                  </Tooltip>
                  {isAddress(tokenContractAddress) && (
                    <Tooltip label={"put tokens on sale"}>
                      <PickCoinIcon
                        boxSize={5}
                        cursor="pointer"
                        onClick={() => setTokenSaleModal(true)}
                      />
                    </Tooltip>
                  )}
                </>
              )}
            </Flex>
            <Text px="30px" fontSize={["0.8rem", "1.2rem"]}>
              {channel?.description}
            </Text>
          </Flex>
        </Flex>
      )}
    </>
  );
};

export default ChannelDesc;
