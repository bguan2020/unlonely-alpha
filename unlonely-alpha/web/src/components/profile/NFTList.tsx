import { Text } from "@chakra-ui/react";

import NFTModalRoot from "./NFTModal/NFTModalRoot";
import NFTModalBody from "./NFTModal/NFTModalBody";
import NFTModalFooter from "./NFTModal/NFTModalFooter";
import centerEllipses from "../../utils/centerEllipses";
import { Message } from "../../constants/types/chat";

type Props = {
  message: Message;
  mobile?: boolean;
};

const NFTList: React.FunctionComponent<Props> = ({
  message,
  mobile,
}: Props) => {
  return (
    <>
      {mobile ? (
        <Text
          _hover={{ cursor: "pointer" }}
          fontSize="16px"
          color={message.data.chatColor}
        >
          {message.data.username
            ? message.data.username
            : centerEllipses(message.data.address, 10)}
          :
        </Text>
      ) : (
        <NFTModalRoot
          TriggerButton={
            <Text
              _hover={{ cursor: "pointer" }}
              fontSize="16px"
              color={message.data.chatColor}
              fontWeight="bold"
            >
              {message.data.username
                ? message.data.username
                : centerEllipses(message.data.address, 10)}
              :
            </Text>
          }
        >
          <NFTModalBody
            address={message.data.address}
            author={message.data.username}
            isLens={message.data.isLens}
            lensHandle={message.data.lensHandle}
          />
          <NFTModalFooter />
        </NFTModalRoot>
      )}
    </>
  );
};

export default NFTList;
