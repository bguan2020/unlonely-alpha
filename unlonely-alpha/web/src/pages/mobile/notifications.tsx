import { Button, Flex } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

import { useUser } from "../../hooks/useUser";
import useUpdateUserNotifications from "../../hooks/useUpdateUserNotifications";
import { gql, useLazyQuery } from "@apollo/client";

const GET_ALL_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      id
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

  // const { user } = useUser();
  // const { updateUserNotifications } = useUpdateUserNotifications({
  //   onError: (m) => {
  //     setFormError(m ? m.map((e) => e.message) : ["An unknown error occurred"]);
  //   },
  // });
  // const [formError, setFormError] = useState<null | string[]>(null);

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100%"
    >
      hey
      <Button
        onClick={() => {
          getAllUsers();
        }}
      >
        fetch all users
      </Button>
    </Flex>
  );
}
