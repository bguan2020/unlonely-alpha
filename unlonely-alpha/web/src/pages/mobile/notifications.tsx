import { Box, Button, Flex } from "@chakra-ui/react";
import React from "react";
import { gql, useLazyQuery } from "@apollo/client";

type UserNotificationsType = {
  username: string;
  address: string;
  notificationsTokens: string;
  notificationsLive: boolean;
  notificationsNFCs: boolean;
};

const GET_ALL_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      username
      address
      notificationsTokens
      notificationsLive
      notificationsNFCs
    }
  }
`;

export default function MobileNotifications() {
  const [getAllUsers, { loading, data }] = useLazyQuery(GET_ALL_USERS, {
    fetchPolicy: "no-cache",
  });
  const users = data?.getAllUsers;

  // useEffect(() => {
  //   console.log(users);
  // }, [data]);

  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100%"
    >
      <Button
        onClick={() => {
          getAllUsers();
        }}
        marginTop={8}
      >
        fetch users w/ notifications enabled
      </Button>
      <Box marginTop={8}>
        {users?.map((user: UserNotificationsType) => {
          if (user.notificationsTokens !== "") {
            const tokens = JSON.parse(user.notificationsTokens);
            const filtered = tokens.filter(
              (token: string | undefined) => token !== null
            );

            if (filtered.length === 0) return;

            return (
              <Box marginBottom={8}>
                <Flex>
                  <p>{user.username}</p>
                </Flex>
                <Flex>
                  <p>{user.address}</p>
                </Flex>
                <Flex direction="column">
                  {filtered.map((token: string) => (
                    <Flex marginBottom={2}>
                      <textarea>{token}</textarea>
                    </Flex>
                  ))}
                </Flex>
              </Box>
            );
          }
        })}
      </Box>
    </Flex>
  );
}
