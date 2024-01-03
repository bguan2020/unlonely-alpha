import { LineChart, Line, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";
import { Flex, Text } from "@chakra-ui/react";
import { isAddress } from "viem";

import { useCacheContext } from "../../hooks/context/useCache";
import centerEllipses from "../../utils/centerEllipses";

const VibesTokenExchange = () => {
  const { vibeTokenTxs } = useCacheContext();

  const formattedData = useMemo(() => {
    return vibeTokenTxs.map((tx) => {
      return {
        user: tx.user,
        event: tx.eventName,
        amount: Number(tx.amount),
        newSupply: Number(tx.supply),
      };
    });
  }, [vibeTokenTxs]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Flex
          direction="column"
          bg="rgba(0, 0, 0, 0.2)"
          p="5px"
          borderRadius="15px"
        >
          <Text>{`${
            isAddress(payload[0].payload.user)
              ? centerEllipses(payload[0].payload.user, 13)
              : payload[0].payload.user
          }`}</Text>
          <Text
            color={payload[0].payload.event === "Mint" ? "#46a800" : "#fe2815"}
          >{`${payload[0].payload.event === "Mint" ? "Bought" : "Sold"} ${
            payload[0].payload.amount
          }`}</Text>
          <Text>{`New price: ${payload[0].payload.newSupply}`}</Text>
        </Flex>
      );
    }

    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={formattedData}>
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="newSupply"
          stroke="#8884d8"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default VibesTokenExchange;
