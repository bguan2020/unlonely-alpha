import {
  Button,
  Flex,
  Input,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";

import AppLayout from "../components/layout/AppLayout";
import { useUser } from "../hooks/context/useUser";
import AdminNotifications from "../components/general/AdminNotifications";
import useSoftDeleteChannel from "../hooks/server/useSoftDeleteChannel";

const admins = process.env.NEXT_PUBLIC_ADMINS?.split(",");

export default function AdminPage() {
  const { user } = useUser();

  const isAdmin = useMemo(() => {
    if (admins !== undefined && user?.address) {
      const userAddress = user.address;
      return admins.some((admin) => userAddress === admin);
    }
    return false;
  }, [user, admins]);

  return (
    <AppLayout isCustomHeader={false}>
      {isAdmin && <AdminContent />}
      {!isAdmin && <Text>You're not supposed to be here.</Text>}
    </AppLayout>
  );
}

const AdminContent = () => {
  const toast = useToast();

  const [channelSlugToDelete, setChannelSlugToDelete] = useState<string>("");
  const { softDeleteChannel, loading: softDeleteChannelLoading } =
    useSoftDeleteChannel({
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Channel soft deleted",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setChannelSlugToDelete("");
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete channel",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      },
    });

  return (
    <Flex direction="column" p="10px" gap="20px" bg="#131323">
      <Text fontSize="25px" fontFamily="Neue Pixel Sans">
        delete channel
      </Text>
      <Flex gap={"10px"} alignItems="flex-end">
        <VStack>
          <Text>slug</Text>
          <Input
            variant="glow"
            width="300px"
            isInvalid={channelSlugToDelete.length === 0}
            value={channelSlugToDelete}
            onChange={(e) => setChannelSlugToDelete(e.target.value)}
          />
        </VStack>
        {softDeleteChannelLoading ? (
          <Spinner />
        ) : (
          <Button
            color="white"
            bg="#2562db"
            _hover={{}}
            _focus={{}}
            _active={{}}
            onClick={() =>
              softDeleteChannel({
                slug: channelSlugToDelete,
              })
            }
            isDisabled={channelSlugToDelete.length === 0}
          >
            Send
          </Button>
        )}
      </Flex>
      <Text fontSize="25px" fontFamily="Neue Pixel Sans">
        admin notifications
      </Text>
      <AdminNotifications />
    </Flex>
  );
};
