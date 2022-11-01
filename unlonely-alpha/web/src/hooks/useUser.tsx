import { gql } from "@apollo/client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useQuery } from "@apollo/client";

import { User } from "../generated/graphql";

const GET_USER_QUERY = gql`
  query getUser($data: GetUserInput!) {
    getUser(data: $data) {
      address
      username
      signature
      bio
      powerUserLvl
      videoSavantLvl
      FCImageUrl
      isFCUser
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

export const UserProvider = ({ children }: { children: JSX.Element }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const { address } = useAccount();
  const { data, loading, error } = useQuery(GET_USER_QUERY, {
    variables: { data: { address } },
  });

  useEffect(() => {
    setUser(data?.getUser);
  }, [data]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
