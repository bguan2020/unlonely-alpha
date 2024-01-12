import { Flex, Input, useBreakpointValue } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Channel } from "../../generated/graphql";
import ChannelCard from "./ChannelCard";

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

const ChannelList: React.FunctionComponent<Props> = ({
  channels,
  suggestedChannels,
  addChannelToSubscription,
  removeChannelFromSubscription,
  handleGetSubscription,
  endpoint,
  callback,
  indexOfOwner,
}) => {
  const fullWidthSearchbar = useBreakpointValue({
    base: true,
    sm: true,
    md: false,
    xl: false,
  });

  const ref = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const debounceDelay = 300; // milliseconds

  const filteredChannels = useMemo(() => {
    return channels?.filter((c) =>
      debouncedSearch.length > 0
        ? (c.owner.username ?? c.owner.address).includes(debouncedSearch)
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
      >
        {filteredChannels.map(
          (h: Channel, i) =>
            !!h && (
              <ChannelCard
                key={h.id}
                channel={h}
                subscribed={suggestedChannels?.includes(String(h.id)) ?? false}
                addChannelToSubscription={addChannelToSubscription}
                removeChannelFromSubscription={removeChannelFromSubscription}
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
      </Flex>
    </Flex>
  );
};

export default ChannelList;
