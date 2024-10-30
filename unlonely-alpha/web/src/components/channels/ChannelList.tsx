import { Flex, Input, useBreakpointValue, Text } from "@chakra-ui/react";
import { memo, useEffect, useMemo, useRef, useState } from "react";

import { Channel } from "../../generated/graphql";
import ChannelCard from "./ChannelCard";
import useUserAgent from "../../hooks/internal/useUserAgent";

type Props = {
  channels: Channel[];
  suggestedChannels?: string[];
  addChannelToSubscription: any;
  removeChannelFromSubscription: any;
  handleGetSubscription: () => void;
  endpoint: string;
  callback: (slug: string, redirect?: boolean) => void;
  indexOfOwner: number;
};

const ChannelList = memo(
  ({
    channels,
    suggestedChannels,
    addChannelToSubscription,
    removeChannelFromSubscription,
    handleGetSubscription,
    endpoint,
    callback,
    indexOfOwner,
  }: Props) => {
    const { isStandalone } = useUserAgent();
    const fullWidthSearchbar = useBreakpointValue({
      base: true,
      sm: true,
      md: false,
      xl: false,
    });

    const ref = useRef<HTMLDivElement>(null);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const debounceDelay = 200; // milliseconds

    const filteredChannels = useMemo(() => {
      return channels?.filter((c) =>
        debouncedSearch.length > 0
          ? c.owner.username
              ?.toLowerCase()
              ?.includes(debouncedSearch?.toLowerCase()) ||
            c.owner.address
              .toLowerCase()
              ?.includes(debouncedSearch?.toLowerCase()) ||
            c.slug.toLowerCase()?.includes(debouncedSearch?.toLowerCase())
          : c
      );
    }, [channels, debouncedSearch]);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedSearch(search);
      }, debounceDelay);

      return () => {
        clearTimeout(handler);
      };
    }, [search, debounceDelay]);

    useEffect(() => {
      const el = ref.current;
      if (!el) return;

      const handleWheel = (e: WheelEvent) => {
        if (e.deltaY === 0) return;
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      };

      el.addEventListener("wheel", handleWheel);
      return () => el.removeEventListener("wheel", handleWheel);
    }, []);

    return (
      <Flex direction="column">
        <Input
          variant="glow"
          placeholder="search for a streamer"
          width={fullWidthSearchbar ? "100%" : "300px"}
          value={search}
          fontSize={isStandalone ? "16px" : "unset"}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Flex
          ref={ref}
          direction="row"
          overflowX="scroll"
          overflowY="clip"
          width="100%"
          height={{
            base: "15rem",
            sm: "20rem",
            md: "20rem",
            lg: "20rem",
          }}
          gap={"1rem"}
          py="1rem"
          justifyContent={filteredChannels.length === 0 ? "center" : "unset"}
        >
          {filteredChannels.length > 0 &&
            filteredChannels.map(
              (h: Channel, i) =>
                !!h && (
                  <ChannelCard
                    key={h.id}
                    channel={h}
                    subscribed={
                      suggestedChannels?.includes(String(h.id)) ?? false
                    }
                    addChannelToSubscription={addChannelToSubscription}
                    removeChannelFromSubscription={
                      removeChannelFromSubscription
                    }
                    handleGetSubscription={handleGetSubscription}
                    endpoint={endpoint}
                    callback={callback}
                    isOwner={
                      filteredChannels.length < channels.length
                        ? false
                        : indexOfOwner === i
                    }
                  />
                )
            )}
          {filteredChannels.length === 0 && (
            <Flex alignItems={"center"}>
              <Text textAlign={"center"} fontSize="40px">
                can't find channels
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>
    );
  }
);

export default ChannelList;
