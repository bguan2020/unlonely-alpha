import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Flex, Text, IconButton, Box, Image, Link } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { TiPin } from "react-icons/ti";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useUser } from "../../hooks/context/useUser";
import { MdClose } from "react-icons/md";
import { areAddressesEqual } from "../../utils/validation/wallet";

type Props = {
  messageText: string;
  handlePinCallback: (value: string) => void;
};

const PinnedMessageBody = ({ messageText, handlePinCallback }: Props) => {
  const { user } = useUser();

  const { channel: c } = useChannelContext();
  const { channelQueryData, channelRoles } = c;

  const linkArray: RegExpMatchArray | null = useMemo(
    () => messageText.match(/((https?:\/\/)|(www\.))[^\s/$.?#].[^\s]*/g),
    [messageText]
  );

  const userIsChannelOwner = useMemo(
    () =>
      areAddressesEqual(
        user?.address ?? "",
        channelQueryData?.owner?.address ?? ""
      ),
    [user, channelQueryData]
  );
  const userIsModerator = useMemo(
    () =>
      channelRoles?.some((m) => m?.address === user?.address && m?.role === 2),
    [user, channelRoles]
  );

  const isGif = useMemo(
    () =>
      messageText?.includes("https://i.imgur.com/") ||
      messageText?.includes("https://media.tenor.com/"),
    [messageText]
  );

  const fragments = useMemo(() => {
    let lastIndex = 0;
    const fragments: { message: string; isLink: boolean }[] = [];

    linkArray?.forEach((link) => {
      const startIndex = messageText.indexOf(link, lastIndex);
      if (startIndex > lastIndex) {
        fragments.push({
          message: messageText.substring(lastIndex, startIndex),
          isLink: false,
        });
      }
      fragments.push({ message: link, isLink: true });
      lastIndex = startIndex + link.length;
    });

    if (lastIndex < messageText.length) {
      fragments.push({
        message: messageText.substring(lastIndex),
        isLink: false,
      });
    }

    return fragments;
  }, [messageText, linkArray]);

  const [mouseHover, setMouseHover] = useState(false);

  return (
    <Flex
      onMouseEnter={
        userIsChannelOwner || userIsModerator
          ? () => setMouseHover(true)
          : undefined
      }
      onMouseLeave={
        userIsChannelOwner || userIsModerator
          ? () => setMouseHover(false)
          : undefined
      }
      justifyContent={"start"}
      borderRadius="10px"
      position={"relative"}
      bg={"#9e6b0c"}
      m="2px"
    >
      <Flex width="100%" alignItems={"center"}>
        <Flex display="inline-block" verticalAlign="middle">
          <TiPin />
        </Flex>
        <Box px="0.3rem" position="relative">
          <Text as="span">
            {isGif && (
              <>
                <Image
                  src={messageText}
                  display="inline"
                  verticalAlign={"middle"}
                  h="40px"
                  p="5px"
                />
                <Image
                  src={messageText}
                  display="inline"
                  verticalAlign={"middle"}
                  h="40px"
                  p="5px"
                />
                <Image
                  src={messageText}
                  display="inline"
                  verticalAlign={"middle"}
                  h="40px"
                  p="5px"
                />
              </>
            )}
            {!isGif && linkArray && (
              <Text
                as="span"
                color="#15dae4"
                fontSize={"12px"}
                wordBreak="break-word"
                textAlign="left"
              >
                {fragments.map((fragment, i) => {
                  if (fragment.isLink) {
                    return (
                      <Link
                        href={
                          fragment.message.startsWith("https://") ||
                          fragment.message.startsWith("http://")
                            ? fragment.message
                            : "https://".concat(fragment.message)
                        }
                        isExternal
                        key={i}
                      >
                        {fragment.message}
                        <ExternalLinkIcon mx="2px" />
                      </Link>
                    );
                  } else {
                    return <span key={i}>{fragment.message}</span>;
                  }
                })}
              </Text>
            )}
            {!isGif && !linkArray && (
              <Text
                as="span"
                fontSize={"12px"}
                wordBreak="break-word"
                textAlign="left"
                fontStyle={"italic"}
                fontWeight="bold"
              >
                {messageText.split("\n").map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
              </Text>
            )}
          </Text>
        </Box>
      </Flex>
      {mouseHover && (
        <IconButton
          right="2"
          height="20px"
          position="absolute"
          aria-label="pin-message"
          icon={<MdClose />}
          onClick={() => handlePinCallback(messageText)}
        />
      )}
    </Flex>
  );
};

export default PinnedMessageBody;
