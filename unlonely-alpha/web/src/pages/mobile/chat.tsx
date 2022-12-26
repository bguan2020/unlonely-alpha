import { Flex } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { ChatBot } from "../channels/brian";
import AblyChatComponent from "../../components/chat/AblyChataComponent";
import { useUser } from "../../hooks/useUser";
import centerEllipses from "../../utils/centerEllipses";
import { getEnsName } from "../../utils/ens";

export default function Chat() {
  const { user } = useUser();
  const accountData = useAccount();
  const [username, setUsername] = useState<string | null>();
  const [chatBot, setChatBot] = useState<ChatBot[]>([]);

  useEffect(() => {
    const fetchEns = async () => {
      if (accountData?.address) {
        const ens = await getEnsName(accountData.address);
        const username = ens ? ens : centerEllipses(accountData.address, 9);
        setUsername(username);
      }
    };

    fetchEns();
  }, [accountData?.address]);

  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100%"
    >
      <AblyChatComponent
        username={username}
        chatBot={chatBot}
        user={user}
        mobileChat={true}
      />
    </Flex>
  );
}
