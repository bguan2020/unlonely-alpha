import { Button, Flex, Textarea } from "@chakra-ui/react";

import { useChannelContext } from "../../hooks/context/useChannel";
import useUserAgent from "../../hooks/internal/useUserAgent";
import useUpdateChannelText from "../../hooks/server/channel/useUpdateChannelText";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";
import {
  AblyChannelPromise,
  CHANGE_CHANNEL_DETAILS_EVENT,
} from "../../constants";
import { useState } from "react";

export default function EditChannelModal({
  title,
  isOpen,
  callback,
  handleClose,
  ablyChannel,
}: {
  title: string;
  isOpen: boolean;
  callback?: any;
  handleClose: () => void;
  ablyChannel: AblyChannelPromise;
}) {
  const { channel } = useChannelContext();
  const { channelQueryData, realTimeChannelDetails } = channel;
  const { isStandalone } = useUserAgent();

  const [name, setName] = useState<string>(channelQueryData?.name ?? "");
  const [description, setDescription] = useState<string>(
    channelQueryData?.description ?? ""
  );

  const { updateChannelText, loading } = useUpdateChannelText({});

  const onSubmit = async (data: { name: string; description: string }) => {
    await updateChannelText({
      id: channelQueryData?.id,
      name: data.name,
      description: data.description,
    });
    ablyChannel?.publish({
      name: CHANGE_CHANNEL_DETAILS_EVENT,
      data: {
        body: JSON.stringify({
          channelName: data.name,
          channelDescription: data.description,
          chatCommands: realTimeChannelDetails.chatCommands,
          allowNfcs: realTimeChannelDetails.allowNfcs,
          isLive: realTimeChannelDetails.isLive,
        }),
      },
    });
    handleClose();
  };

  // todo: add error message handling here for user

  return (
    <TransactionModalTemplate
      title={title}
      confirmButton={"confirm"}
      isOpen={isOpen}
      isModalLoading={loading}
      handleClose={handleClose}
      hideFooter
      size={isStandalone ? "sm" : "md"}
    >
      <Flex direction="column" gap="16px">
        <Flex
          maxH="400px"
          margin="auto"
          flexDirection="row"
          position="relative"
        >
          <Textarea
            id="name"
            placeholder={"Enter a title for your stream."}
            defaultValue={channelQueryData?.name ?? ""}
            onChange={(e) => setName(e.target.value)}
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
          />
        </Flex>
        <Flex direction="row" justifyContent={"center"}>
          <Textarea
            id="description"
            placeholder={"Enter a description for your channel"}
            defaultValue={channelQueryData?.description ?? ""}
            onChange={(e) => setDescription(e.target.value)}
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
          />
        </Flex>
        <Flex>
          <Button
            color="white"
            bg="#E09025"
            _hover={{}}
            _focus={{}}
            _active={{}}
            width="100%"
            borderRadius="10px"
            onClick={() => onSubmit({ name, description })}
          >
            Submit
          </Button>
        </Flex>
      </Flex>
    </TransactionModalTemplate>
  );
}
