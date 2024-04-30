import { Button, Spinner } from "@chakra-ui/react";
import { useSetWinningTokenTradeableAndTransferLiquidityState } from "../../../../hooks/internal/versus-token/write/useSetWinningTokenTradeableAndTransferLiquidityState";

export const TransferLiquidityModule = () => {
  const {
    setWinningTokenTradeableAndTransferLiquidity,
    isSetWinningTokenTradeableAndTransferLiquidityLoading,
  } = useSetWinningTokenTradeableAndTransferLiquidityState();

  return (
    <Button
      onClick={setWinningTokenTradeableAndTransferLiquidity}
      isDisabled={
        isSetWinningTokenTradeableAndTransferLiquidityLoading ||
        !setWinningTokenTradeableAndTransferLiquidity
      }
      h="30%"
    >
      {isSetWinningTokenTradeableAndTransferLiquidityLoading ? (
        "Transfer Funds"
      ) : (
        <Spinner />
      )}
    </Button>
  );
};
