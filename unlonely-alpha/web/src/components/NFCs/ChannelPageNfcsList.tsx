import { useLazyQuery } from "@apollo/client";
import { NFC_FEED_QUERY } from "../../constants/queries";
import { NfcFeedQuery } from "../../generated/graphql";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "../../hooks/context/useUser";
import { useChannelContext } from "../../hooks/context/useChannel";
import NfcList from "./NfcList";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Text,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  DrawerCloseButton,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

export const NFC_FETCH_LIMIT = 30;

export const ChannelPageNfcsList = () => {
  const { user } = useUser();
  const { channel, ui } = useChannelContext();
  const { channelQueryData } = channel;
  const { showClipDrawer, handleClipDrawer } = ui;

  const [call, { loading }] = useLazyQuery(NFC_FEED_QUERY);
  const [pagesFetched, setPagesFetched] = useState(0);
  const [filterNfcsByUserOnly, setFilterNfcsByUserOnly] = useState(false);
  const [channelNfcs, setChannelNfcs] = useState<NfcFeedQuery["getNFCFeed"]>(
    []
  );

  const [fetchedUnderLimit, setFetchedUnderLimit] = useState(false);

  const fetchNfcs = useCallback(async () => {
    if (!channelQueryData?.id) return;
    const nfcsData = await call({
      variables: {
        data: {
          limit: NFC_FETCH_LIMIT,
          orderBy: "createdAt",
          channelId: Number(channelQueryData.id),
          offset: pagesFetched * NFC_FETCH_LIMIT,
        },
      },
    });
    const nfcs: NfcFeedQuery["getNFCFeed"] = nfcsData?.data?.getNFCFeed ?? [];
    const filteredNfcs = (nfcs ?? []).filter(
      (nfc): nfc is NonNullable<typeof nfc> => nfc !== null && nfc !== undefined
    );
    setPagesFetched((prev) => prev + 1);
    setFetchedUnderLimit(filteredNfcs.length < NFC_FETCH_LIMIT);
    setChannelNfcs((prev) => [...(prev || []), ...filteredNfcs]);
  }, [channelQueryData?.id, user?.address, pagesFetched]);

  useEffect(() => {
    if (showClipDrawer && channelNfcs?.length === 0) {
      console.log("running on first open");
      fetchNfcs();
    }
  }, [channelQueryData?.id, showClipDrawer, channelNfcs]);

  return (
    <Drawer
      size={"xl"}
      placement={"bottom"}
      onClose={() => handleClipDrawer(false)}
      isOpen={showClipDrawer}
    >
      <DrawerContent bgColor={"rgba(1, 0, 42, 0.8)"}>
        <DrawerHeader borderBottomWidth="1px">
          <Flex alignItems={"center"} gap="10px">
            <Text>CLIPS from /{channelQueryData?.slug}</Text>
            <Menu>
              <Flex
                p="1px"
                bg={
                  "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
                }
              >
                <MenuButton
                  color="white"
                  width={"100%"}
                  as={Button}
                  borderRadius="0"
                  _hover={{ bg: "#020202" }}
                  _focus={{}}
                  _active={{}}
                  bg={"#131323"}
                  px="10px"
                  rightIcon={<ChevronDownIcon />}
                >
                  <Text fontFamily="LoRes15" fontSize="15px">
                    {filterNfcsByUserOnly ? "showing my clips" : "no filter"}
                  </Text>
                </MenuButton>
              </Flex>
              <MenuList zIndex={1801} bg={"#131323"} borderRadius="0">
                <MenuItem
                  bg={"#131323"}
                  _hover={{ bg: "#1f1f3c" }}
                  _focus={{}}
                  _active={{}}
                  onClick={() => setFilterNfcsByUserOnly(true)}
                >
                  <Text fontSize="15px">my clips</Text>
                </MenuItem>
                <MenuItem
                  bg={"#131323"}
                  _hover={{ bg: "#1f1f3c" }}
                  _focus={{}}
                  _active={{}}
                  onClick={() => setFilterNfcsByUserOnly(false)}
                >
                  <Text fontSize="15px">clear filter</Text>
                </MenuItem>
              </MenuList>
            </Menu>
            <DrawerCloseButton />
          </Flex>
        </DrawerHeader>
        <DrawerBody>
          <NfcList
            nfcs={(channelNfcs ?? []).filter((nfc) => {
              if (filterNfcsByUserOnly) {
                return (
                  nfc?.owner?.address.toLowerCase() ===
                  user?.address.toLowerCase()
                );
              }
              return true;
            })}
            makeLinksExternal
            nextButton={
              !fetchedUnderLimit
                ? {
                    label: "load more",
                    onClick: fetchNfcs,
                  }
                : undefined
            }
            loading={loading}
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
