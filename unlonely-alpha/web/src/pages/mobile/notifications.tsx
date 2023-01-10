import { Flex } from "@chakra-ui/react";
import React, { useState } from "react";

import { useUser } from "../../hooks/useUser";
import useUpdateUserNotifications from "../../hooks/useUpdateUserNotifications";

export default function Chat() {
  const { user } = useUser();
  const { updateUserNotifications } = useUpdateUserNotifications({
    onError: (m) => {
      setFormError(m ? m.map((e) => e.message) : ["An unknown error occurred"]);
    },
  });
  const [formError, setFormError] = useState<null | string[]>(null);


  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100%"
    >
     {"notifications i guess..."}
    </Flex>
  );
}
