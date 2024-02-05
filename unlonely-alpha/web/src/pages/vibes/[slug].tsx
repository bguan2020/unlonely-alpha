import { Flex } from "@chakra-ui/react";

import VibesTokenInterface from "../../components/chat/VibesTokenInterface";
import { ChannelProvider } from "../../hooks/context/useChannel";
import { useChat } from "../../hooks/chat/useChat";
import AppLayout from "../../components/layout/AppLayout";

const FullVibesChartPage = () => {
  return (
    <AppLayout isCustomHeader={false} noHeader>
      <ChannelProvider>
        <FullVibesChart />
      </ChannelProvider>
    </AppLayout>
  );
};

const FullVibesChart = () => {
  const chat = useChat();

  return (
    <Flex h="100vh" justifyContent={"space-between"} bg="#131323" p="0.5rem">
      <VibesTokenInterface isFullChart ablyChannel={chat.channel} />
    </Flex>
  );
};

export default FullVibesChartPage;
