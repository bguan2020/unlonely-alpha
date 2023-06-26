import { gql } from "@apollo/client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useQuery } from "@apollo/client";

import { User } from "../generated/graphql";
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
  setUser: (u: User | undefined) => void;
}>({
  user: undefined,
  setUser: () => {},
});

export const UserProvider = ({
  children,
}: {
  children: JSX.Element[] | JSX.Element;
}) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const { address } = useAccount();
  // ignore console log build error for now
  //
  const { data, loading, error } = useQuery(GET_USER_QUERY, {
    variables: { data: { address } },
  });

  useEffect(() => {
    setUser(data?.getUser);
  }, [data]);
  console.log("useUser", user, loading, error);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
