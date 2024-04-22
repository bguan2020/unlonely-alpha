import {
  Avatar,
  Text,
  Flex,
  Tooltip,
  IconButton,
  Link,
  Button,
} from "@chakra-ui/react";
import { Fragment, useMemo, useState } from "react";
import { anonUrl } from "../presence/AnonUrl";
import { useChannelContext } from "../../hooks/context/useChannel";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { BorderType, OuterBorder } from "../general/OuterBorder";
import { getColorFromString } from "../../styles/Colors";
import { FaPencilAlt } from "react-icons/fa";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useUser } from "../../hooks/context/useUser";
import { SessionsModal } from "./SessionsModal";

const ChannelDesc = () => {
  const { walletIsConnected } = useUser();
  const { isStandalone } = useUserAgent();
  const { channel, ui } = useChannelContext();
  const { channelQueryData, totalBadges, realTimeChannelDetails, isOwner } =
    channel;
  const { handleEditModal } = ui;

  const [sessionsModal, setSessionsModal] = useState(false);

  const imageUrl = channelQueryData?.owner?.FCImageUrl
    ? channelQueryData?.owner.FCImageUrl
    : channelQueryData?.owner?.lensImageUrl
    ? channelQueryData?.owner.lensImageUrl
    : anonUrl;
  const ipfsUrl = imageUrl.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${imageUrl.slice(7)}`
    : imageUrl;

  return (
    <Flex direction="row" m="1rem">
      <Flex direction="column" gap={["4px", "16px"]}>
        <SessionsModal
          title={`stream activity for /${channelQueryData?.slug}`}
          isOpen={sessionsModal}
          handleClose={() => setSessionsModal(false)}
        />
        <Flex justifyContent={"center"}>
          <Avatar
            name={
              channelQueryData?.owner.username
                ? channelQueryData?.owner.username ?? ""
                : channelQueryData?.owner.address ?? ""
            }
            src={ipfsUrl}
            bg={getColorFromString(
              channelQueryData?.owner.username
                ? channelQueryData?.owner.username ?? ""
                : channelQueryData?.owner.address ?? ""
            )}
            size="md"
          />
        </Flex>
        <OuterBorder flex={"0"} type={BorderType.FIRE} margin={"auto"}>
          <Flex
            p="0.5rem"
            bg={
              "linear-gradient(163deg, rgba(231,204,126,1) 0%, rgba(203,167,60,1) 7%, rgba(201,149,13,1) 32%, rgba(195,128,27,1) 43%, rgba(167,103,0,1) 63%, rgba(112,53,0,1) 100%)"
            }
          >
            <Tooltip
              label="this shows how many VIP badges have been purchased on this channel!"
              shouldWrapChildren
            >
              <Text fontSize="14px" textAlign={"center"} fontFamily="LoRes15">
                <Text fontSize="20px">{truncateValue(totalBadges, 0)}</Text>
                badges
              </Text>
            </Tooltip>
          </Flex>
        </OuterBorder>
        {channelQueryData?.livepeerStreamId && (
          <Button
            p="1"
            bg="#013eb9"
            _hover={{
              transform: "scale(1.05)",
            }}
            _active={{}}
            _focus={{}}
            onClick={() => setSessionsModal(true)}
          >
            <Text color="white">recordings</Text>
          </Button>
        )}
      </Flex>
      <Flex
        direction="column"
        gap={["4px", "16px"]}
        width="100%"
        pl="30px"
        data-tour="s-step-4"
      >
        <Flex
          maxH="400px"
          justifyContent="left"
          flexDirection="row"
          alignItems={"center"}
          gap="1rem"
          wordBreak={"break-all"}
        >
          <Text
            fontSize={["1rem", "25px"]}
            fontWeight="bold"
            noOfLines={2}
            wordBreak={"break-word"}
            width={isStandalone ? "70%" : "unset"}
          >
            {realTimeChannelDetails.channelName}
          </Text>
          {isOwner && walletIsConnected && (
            <IconButton
              aria-label="edit channel title"
              _focus={{}}
              _active={{}}
              _hover={{
                transform: "scale(1.2)",
              }}
              icon={<FaPencilAlt color="white" />}
              bg="transparent"
              onClick={() => handleEditModal(true)}
            />
          )}
        </Flex>
        <Text
          fontSize={["0.5rem", "0.8rem"]}
          width={isStandalone ? "70%" : "unset"}
        >
          {realTimeChannelDetails.channelDescription
            .split("\n")
            .map((line, index) => (
              <Fragment key={index}>
                <LineFormatter line={line} />
                <br />
              </Fragment>
            ))}
        </Text>
      </Flex>
    </Flex>
  );
};

const LineFormatter = ({ line }: { line: string }) => {
  const linkArray: RegExpMatchArray | null = line.match(
    /((https?:\/\/)|(www\.))[^\s/$.?#].[^\s]*/g
  );

  const fragments = useMemo(() => {
    let lastIndex = 0;
    const fragments: { message: string; isLink: boolean }[] = [];

    linkArray?.forEach((link) => {
      const startIndex = line.indexOf(link, lastIndex);
      if (startIndex > lastIndex) {
        fragments.push({
          message: line.substring(lastIndex, startIndex),
          isLink: false,
        });
      }
      fragments.push({ message: link, isLink: true });
      lastIndex = startIndex + link.length;
    });

    if (lastIndex < line.length) {
      fragments.push({
        message: line.substring(lastIndex),
        isLink: false,
      });
    }

    return fragments;
  }, [line, linkArray]);

  return (
    <>
      {fragments.map((fragment, i) => {
        if (fragment.isLink) {
          return (
            <Link href={fragment.message} isExternal key={i}>
              <Text
                as="span"
                color="#15dae4"
                fontSize={"12px"}
                wordBreak="break-word"
                textAlign="left"
              >
                {fragment.message}
                <ExternalLinkIcon mx="2px" />
              </Text>
            </Link>
          );
        } else {
          return <span key={i}>{fragment.message}</span>;
        }
      })}
    </>
  );
};

export default ChannelDesc;
