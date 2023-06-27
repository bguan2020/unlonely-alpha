import { gql } from "@apollo/client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAccount, useEnsName } from "wagmi";
import { useQuery } from "@apollo/client";

import { User } from "../../generated/graphql";
import centerEllipses from "../../utils/centerEllipses";
/* eslint-disable */
const GET_USER_QUERY = gql`
  query getUser($data: GetUserInput!) {
    getUser(data: $data) {
      address
      username
      signature
      bio
      powerUserLvl
      videoSavantLvl
      nfcRank
      FCImageUrl
      isFCUser
      isLensUser
      lensHandle
      lensImageUrl
    }
  }
`;

export const useUser = () => {
  return useContext(UserContext);
};

const UserContext = createContext<{
  user: User | undefined;
  username?: string;
  setUser: (u: User | undefined) => void;
}>({
  user: undefined,
  username: undefined,
  setUser: () => {},
});

export const UserProvider = ({
  children,
}: {
  children: JSX.Element[] | JSX.Element;
}) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [username, setUsername] = useState<string | undefined>();
  const accountData = useAccount();
  // ignore console log build error for now
  //
  const { data, loading, error } = useQuery(GET_USER_QUERY, {
    variables: { data: { address: accountData.address } },
  });

  const { data: ensData } = useEnsName({
    address: accountData?.address,
  });

  useEffect(() => {
    const fetchEns = async () => {
      if (accountData?.address) {
        const username = ensData ?? centerEllipses(accountData.address, 9);
        setUsername(username);
      }
    };

    fetchEns();
  }, [accountData?.address, ensData]);

  useEffect(() => {
    setUser(data?.getUser);
  }, [data]);

  const value = useMemo(
    () => ({ user, username, setUser }),
    [user, username, setUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
