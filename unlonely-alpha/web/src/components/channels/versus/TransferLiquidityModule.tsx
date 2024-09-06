import { Button, Spinner, Flex, Text } from "@chakra-ui/react";
import { useSetWinningTokenTradeableAndTransferLiquidityState } from "../../../hooks/internal/versus-token/write/useSetWinningTokenTradeableAndTransferLiquidityState";
import { useState, useEffect } from "react";
import { useVersusTempTokenContext } from "../../../hooks/context/useVersusTempToken";

export const TransferLiquidityModule = () => {
  const {
    callSetWinningTokenTradeableAndTransferLiquidity,
    refetchSetWinningTokenTradeableAndTransferLiquidity,
    isFunctionAvailable,
    loading,
  } = useSetWinningTokenTradeableAndTransferLiquidityState();
  const { gameState } = useVersusTempTokenContext();
  const { tokenA, tokenB } = gameState;

  // State to control the interval
  const [intervalId, setIntervalId] = useState<any>(null);

  // Effect to start polling
  useEffect(() => {
    if (!isFunctionAvailable && !intervalId) {
      const id = setInterval(() => {
        console.log("Refetching the availability of the transfer function...");
        refetchSetWinningTokenTradeableAndTransferLiquidity();
      }, 5000); // Poll every 5 seconds
      setIntervalId(id);
    }

    // Cleanup on component unmount or when the function becomes available
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isFunctionAvailable, intervalId]);

  return (
    <Flex justifyContent={"space-evenly"}>
      <Button
        bg="rgba(255, 36, 36, 1)"
        onClick={() => callSetWinningTokenTradeableAndTransferLiquidity(true)}
        isDisabled={loading || !isFunctionAvailable}
        h="30px"
      >
        {loading ? <Spinner /> : <Text>${tokenA.symbol}</Text>}
      </Button>
      <Button
        bg="rgba(42, 217, 255, 1)"
        onClick={() => callSetWinningTokenTradeableAndTransferLiquidity(false)}
        isDisabled={loading || !isFunctionAvailable}
        h="30px"
      >
        {loading ? <Spinner /> : <Text>${tokenB.symbol}</Text>}
      </Button>
    </Flex>
  );
};
