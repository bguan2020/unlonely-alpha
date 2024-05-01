import { Flex, Button, Text } from "@chakra-ui/react";
import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";
import { useVersusTempTokenContext } from "../../../hooks/context/useVersusTempToken";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { useEffect } from "react";
import { isAddress } from "viem";
import { useUser } from "../../../hooks/context/useUser";
import { InteractionType } from "../../../constants";
import { useRouter } from "next/router";

export const VersusTokenGameFinishedModal = ({
  title,
  isOpen,
  handleClose,
}: {
  title: string;
  isOpen: boolean;
  handleClose: () => void;
}) => {
  const { userAddress, user } = useUser();
  const { channel, chat } = useChannelContext();
  const { isOwner: isChannelOwner } = channel;
  const { addToChatbot: addToChatbotForTempToken } = chat;
  const router = useRouter();

  const { gameState } = useVersusTempTokenContext();
  const { winningToken, losingToken } = gameState;

  useEffect(() => {
    if (
      isChannelOwner &&
      isOpen &&
      isAddress(winningToken.address) &&
      isAddress(losingToken.address) &&
      router.pathname.startsWith("/channels")
    ) {
      const title = `Game finished! The ${winningToken.symbol} token has won!`;
      addToChatbotForTempToken({
        username: user?.username ?? "",
        address: userAddress ?? "",
        taskType: InteractionType.TEMP_TOKEN_EXPIRED,
        title,
        description: "",
      });
    }
  }, [isChannelOwner, isOpen, winningToken, losingToken, router.pathname]);

  return (
    <TransactionModalTemplate
      title={title}
      isOpen={isOpen}
      handleClose={handleClose}
      bg={"#18162F"}
      hideFooter
    >
      <Text>The ${winningToken.symbol} token has won!</Text>
      <Flex justifyContent={"space-evenly"} gap="5px">
        <Button onClick={handleClose}>Continue</Button>
      </Flex>
    </TransactionModalTemplate>
  );
};
