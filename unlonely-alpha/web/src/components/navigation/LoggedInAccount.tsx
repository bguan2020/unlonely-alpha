import {
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
  PopoverBody,
  Flex,
  Text,
} from "@chakra-ui/react";
import { useAccount, useNetwork, useBalance } from "wagmi";
import { useRouter } from "next/router";

import centerEllipses from "../../utils/centerEllipses";
import GradientAvatar from "../general/GradientAvatar";
import formatNumberToWithFractionalDigits from "../../utils/formatNumberToWithFractionalDigits";
import getTokenBalanceToDecimal from "../../utils/getTokenBalanceToDecimal";

const styles = {
  PopoverButton: {
    fontStyle: "15px",
    fontWeight: "medium",
    lineHeight: "32px",
    width: "100%",
    height: "fit-content",
    borderRadius: "none",
    justifyContent: "center",
    background: "transparent",
    paddingX: "0px",
    _hover: { opacity: 0.8, textDecoration: "none" },
    _active: { opacity: 0.6 },
  },
  PopoverIcon: {
    w: "14px",
    h: "14px",
  },
};

const LoggedInAccount: React.FunctionComponent = () => {
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  });

  const [{ data: accountBalance }] = useBalance({
    addressOrName: accountData?.address,
  });
  const [network] = useNetwork();
  const router = useRouter();

  const profileClick = () => {
    router.push(`/profile/${accountData?.address}`);
  };

  return (
    <Popover placement="bottom">
      <PopoverTrigger>
        <Button
          padding="4px"
          _focus={{ boxShadow: "none" }}
          background="#717BA7"
          color="white"
          borderRadius="20px"
          marginRight="20px"
          gap="8px"
        >
          <GradientAvatar size={22} />
          <Text marginLeft="10px">
            {centerEllipses(accountData?.address, 10)}
          </Text>
          <Flex
            fontSize="13px"
            fontWeight="medium"
            color="white"
            height="100%"
            alignItems="center"
            backgroundColor="#27415E"
            borderRadius="full"
            paddingX="10px"
            marginLeft="10px"
          >{`${formatNumberToWithFractionalDigits(
            getTokenBalanceToDecimal(
              /* Need to investigate how to customize provider(current assumption) to pull
               * balance data from other networks, not just Ethereum Mainnet.
               * https://linear.app/memprotocol/issue/MEM-634/get-token-value-for-other-networks-including-matic
               */
              Number(accountBalance?.value._hex),
              network?.data.chain?.nativeCurrency?.decimals
            ),
            {
              maximumFractionDigits: 0,
            }
          )} ETH`}</Flex>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        maxWidth="220px"
        borderRadius="12px"
        borderColor="#5B5B5B"
        background="#5B5B5B"
      >
        <PopoverBody display="flex" flexDirection="column" padding="0px 8px">
          <Button
            sx={styles.PopoverButton}
            // onClick={profileClick}
            disabled
            color="white"
          >
            Profile (coming soon)
          </Button>
          <Button sx={styles.PopoverButton} onClick={disconnect} color="white">
            Sign Out
          </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default LoggedInAccount;
