import React from "react";

import { ChannelProvider } from "../../../hooks/context/useChannel";
import AblyChatComponent from "../../../components/mobile/ChatComponent";

export default function Chat() {
  return (
    <ChannelProvider mobile>
      <AblyChatComponent chatBot={[]} />
    </ChannelProvider>
  );
}
