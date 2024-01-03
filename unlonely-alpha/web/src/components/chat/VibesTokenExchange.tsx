import { LineChart, Line, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo, useState } from "react";
import { Button, Flex, Input, Text } from "@chakra-ui/react";
import { isAddress } from "viem";

import { useCacheContext } from "../../hooks/context/useCache";
import centerEllipses from "../../utils/centerEllipses";
import { filteredInput } from "../../utils/validation/input";

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

  const [amountOfVibes, setAmountOfVibes] = useState<string>("1");

  const handleInputChange = (event: any) => {
    const input = event.target.value;
    const filtered = filteredInput(input);
    setAmountOfVibes(filtered);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Flex
          direction="column"
          bg="rgba(0, 0, 0, 0.5)"
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
    <>
      <Text
        position="absolute"
        fontSize={"20px"}
        color="#c6c3fc"
        fontWeight="bold"
      >
        $VIBES
      </Text>
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
      <Flex direction="column" justifyContent={"space-evenly"}>
        <Input
          variant="glow"
          textAlign="center"
          width={"70px"}
          value={amountOfVibes}
          onChange={handleInputChange}
          mx="auto"
        />
        <Button color="white" _focus={{}} _hover={{}} _active={{}} bg="#46a800">
          BUY
        </Button>
        <Button color="white" _focus={{}} _hover={{}} _active={{}} bg="#fe2815">
          SELL
        </Button>
      </Flex>
    </>
  );
};

export default VibesTokenExchange;
