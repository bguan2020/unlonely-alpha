import { Spinner, Flex, Text, Avatar } from "@chakra-ui/react";

import AppLayout from "../components/layout/AppLayout";
import { useUser } from "../hooks/context/useUser";
import useUserAgent from "../hooks/internal/useUserAgent";
import { anonUrl } from "../components/presence/AnonUrl";
import centerEllipses from "../utils/centerEllipses";
import ConnectWallet from "../components/navigation/ConnectWallet";

const Profile = () => {
  const { user } = useUser();
  const { ready } = useUserAgent();

  const imageUrl = user?.FCImageUrl
    ? user.FCImageUrl
    : user?.lensImageUrl
    ? user.lensImageUrl
    : anonUrl;
  // if imageUrl begins with  ipfs://, convert to https://ipfs.io/ipfs/
  const ipfsUrl = imageUrl.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${imageUrl.slice(7)}`
    : imageUrl;

  return (
    <AppLayout isCustomHeader={false}>
      {ready ? (
        <Flex
          direction="column"
          width="100vw"
          position="relative"
          height="100%"
          p="15px"
        >
          <Text color="#e2f979" fontFamily="Neue Pixel Sans" fontSize={"25px"}>
            connected as
          </Text>
          <Flex justifyContent={"space-between"} alignItems="center">
            <Flex gap="10px">
              <Avatar
                name={user?.username ?? user?.address}
                src={ipfsUrl}
                size="md"
              />
              {user?.username ? (
                <Flex direction="column">
                  <Text>{user?.username}</Text>
                  <Text color="#9d9d9d">
                    {centerEllipses(user?.address, 13)}
                  </Text>
                </Flex>
              ) : (
                <Flex direction="column" justifyContent="center">
                  <Text color="#9d9d9d">
                    {centerEllipses(user?.address, 13)}
                  </Text>
                </Flex>
              )}
            </Flex>
            <ConnectWallet shouldSayDisconnect />
          </Flex>
        </Flex>
      ) : (
        <Spinner />
      )}
    </AppLayout>
  );
};

export default Profile;
