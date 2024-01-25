import { Flex } from "@chakra-ui/react";

import VibesTokenInterface from "../../components/chat/VibesTokenInterface";
import { ChannelProvider } from "../../hooks/context/useChannel";
import { useChat } from "../../hooks/chat/useChat";

const FullVibesChartPage = () => {
  return (
    <ChannelProvider>
      <FullVibesChart />
    </ChannelProvider>
  );
};

const FullVibesChart = () => {
  const chat = useChat();

  return (
    <Flex h="100vh" justifyContent={"space-between"} bg="#131323" p="20px">
      <VibesTokenInterface isFullChart ablyChannel={chat.channel} />
    </Flex>
  );
};

export default FullVibesChartPage;
