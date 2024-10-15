import { useLazyQuery } from "@apollo/client";
import { Flex, Spinner, Text } from "@chakra-ui/react";
import Link from "next/link";
import { useMemo, useEffect } from "react";
import { GET_CHANNELS_BY_OWNER_ADDRESS_QUERY } from "../../constants/queries";
import { GetChannelsByOwnerAddressQuery } from "../../generated/graphql";
import { useUser } from "../../hooks/context/useUser";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";
import useUserAgent from "../../hooks/internal/useUserAgent";

export const OwnedChannelsModal = ({
  isOpen,
  handleClose,
}: {
  isOpen: boolean;
  handleClose: () => void;
}) => {
  const { user } = useUser();
  const { isStandalone } = useUserAgent();
  const [
    getChannelsByOwnerAddress,
    {
      loading: getChannelsByOwnerAddressLoading,
      data: getChannelsByOwnerAddressData,
      error: getChannelsByOwnerAddressError,
    },
  ] = useLazyQuery<GetChannelsByOwnerAddressQuery>(
    GET_CHANNELS_BY_OWNER_ADDRESS_QUERY,
    {
      variables: { ownerAddress: user?.address },
      fetchPolicy: "network-only",
    }
  );

  const sortedChannels = useMemo(() => {
    return (
      getChannelsByOwnerAddressData?.getChannelsByOwnerAddress?.sort(
        (a, b) => a?.name?.localeCompare(b?.name ?? "") ?? 0
      ) ?? []
    );
  }, [getChannelsByOwnerAddressData?.getChannelsByOwnerAddress]);

  useEffect(() => {
    if (isOpen) getChannelsByOwnerAddress();
  }, [isOpen]);

  return (
    <TransactionModalTemplate
      title={`my channels (${
        getChannelsByOwnerAddressData?.getChannelsByOwnerAddress?.length ?? 0
      })`}
      isOpen={isOpen}
      handleClose={handleClose}
      size={isStandalone ? "sm" : "md"}
      hideFooter
    >
      {getChannelsByOwnerAddressLoading ? (
        <Flex justifyContent="center">
          <Spinner />
        </Flex>
      ) : (
        <>
          {(getChannelsByOwnerAddressData?.getChannelsByOwnerAddress?.length ??
            0) > 0 ? (
            <Flex
              direction={"column"}
              gap="10px"
              maxHeight="300px"
              overflowY={"scroll"}
            >
              {sortedChannels.map((channel) => (
                <Link
                  key={channel?.slug}
                  href={`${window.location.origin}/channels/${channel?.slug}`}
                >
                  <Flex
                    _hover={{
                      bg: "#1f1f3c",
                      transition: "0.3s",
                    }}
                    direction="column"
                    p="10px"
                    bg="rgba(0, 0, 0, 0.5)"
                    borderRadius={"15px"}
                  >
                    <Flex>
                      <Text>{channel?.name}</Text>
                    </Flex>
                    <Flex justifyContent={"space-between"}>
                      <Text fontSize="12px" color="#acacac">
                        /{channel?.slug}
                      </Text>
                    </Flex>
                  </Flex>
                </Link>
              ))}
            </Flex>
          ) : (
            <Flex justifyContent="center">
              <Text>no channels, start by creating one</Text>
            </Flex>
          )}
        </>
      )}
    </TransactionModalTemplate>
  );
};
