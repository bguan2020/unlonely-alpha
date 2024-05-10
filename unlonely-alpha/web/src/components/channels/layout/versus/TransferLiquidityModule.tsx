import { Button, Spinner } from "@chakra-ui/react";
import { useSetWinningTokenTradeableAndTransferLiquidityState } from "../../../../hooks/internal/versus-token/write/useSetWinningTokenTradeableAndTransferLiquidityState";
import { useState, useEffect } from "react";

export const TransferLiquidityModule = () => {
  const {
    setWinningTokenTradeableAndTransferLiquidity,
    refetchSetWinningTokenTradeableAndTransferLiquidity,
    loading,
  } = useSetWinningTokenTradeableAndTransferLiquidityState();

  // State to control the interval
  const [intervalId, setIntervalId] = useState<any>(null);

  // Effect to start polling
  useEffect(() => {
    if (!setWinningTokenTradeableAndTransferLiquidity && !intervalId) {
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
  }, [
    setWinningTokenTradeableAndTransferLiquidity,
    intervalId,
    refetchSetWinningTokenTradeableAndTransferLiquidity,
  ]);

  return (
    <Button
      onClick={setWinningTokenTradeableAndTransferLiquidity}
      isDisabled={loading || !setWinningTokenTradeableAndTransferLiquidity}
      h="20px"
    >
      {loading ? <Spinner /> : "Make Winner Token Tradeable"}
    </Button>
  );
};
