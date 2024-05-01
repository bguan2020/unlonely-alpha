import { Button, Spinner } from "@chakra-ui/react";
import { useSetWinningTokenTradeableAndTransferLiquidityState } from "../../../../hooks/internal/versus-token/write/useSetWinningTokenTradeableAndTransferLiquidityState";

export const TransferLiquidityModule = () => {
  const { setWinningTokenTradeableAndTransferLiquidity, loading } =
    useSetWinningTokenTradeableAndTransferLiquidityState();

  return (
    <Button
      onClick={setWinningTokenTradeableAndTransferLiquidity}
      isDisabled={loading || !setWinningTokenTradeableAndTransferLiquidity}
      h="30%"
    >
      {loading ? <Spinner /> : "Transfer Funds"}
    </Button>
  );
};
