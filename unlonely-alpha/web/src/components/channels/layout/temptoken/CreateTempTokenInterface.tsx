import { Button, Flex, Input, Spinner, Text, Tooltip } from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { NULL_ADDRESS } from "../../../../constants";
import { ContractData } from "../../../../constants/types";
import { useNetworkContext } from "../../../../hooks/context/useNetwork";
import { useTempTokenContext } from "../../../../hooks/context/useTempToken";
import { useSendRemainingFundsToWinnerState } from "../../../../hooks/internal/temp-token/write/useSendRemainingFundsToWinnerState";
import { TempTokenCreationModal } from "../../temp/TempTokenCreationModal";
import TempTokenAbi from "../../../../constants/abi/TempTokenV1.json";

export const CreateTokenInterface = () => {
  const { tempToken } = useTempTokenContext();
  const { lastInactiveTokenAddress, lastInactiveTokenBalance } = tempToken;
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const [createTokenModalOpen, setCreateTokenModalOpen] = useState(false);

  const inactiveTempTokenContract: ContractData = useMemo(() => {
    if (!lastInactiveTokenAddress) {
      return {
        address: NULL_ADDRESS,
        abi: undefined,
        chainId: localNetwork.config.chainId,
      };
    }
    return {
      address: lastInactiveTokenAddress as `0x${string}`,
      abi: TempTokenAbi,
      chainId: localNetwork.config.chainId,
    };
  }, [lastInactiveTokenAddress, localNetwork.config.chainId]);

  const {
    sendRemainingFundsToWinnerAfterTokenExpiration,
    loading: sendRemainingFundsToWinnerAfterTokenExpirationTxLoading,
    handleWinnerChange,
    winner,
    resolvedAddress,
  } = useSendRemainingFundsToWinnerState(inactiveTempTokenContract);

  return (
    <>
      {lastInactiveTokenAddress === NULL_ADDRESS &&
      lastInactiveTokenBalance === BigInt(0) ? (
        <>
          <TempTokenCreationModal
            title="Create Temp Token"
            isOpen={createTokenModalOpen}
            handleClose={() => setCreateTokenModalOpen(false)}
          />
          <Button onClick={() => setCreateTokenModalOpen(true)}>
            create temp token
          </Button>
        </>
      ) : (
        <Flex direction="column" gap="5px">
          <Text>Your last token that had expired still has a balance</Text>
          <Text>
            Please provide an address or an ENS to send it before creating a new
            one
          </Text>
          <Tooltip
            placement="top"
            shouldWrapChildren
            isOpen={resolvedAddress}
            isDisabled={!resolvedAddress}
            label={`This ENS points to ${resolvedAddress}`}
            bg="#078410"
          >
            <Input
              variant="glow"
              value={winner}
              onChange={(e) => handleWinnerChange(e.target.value)}
            />
          </Tooltip>
          <Button
            isDisabled={
              sendRemainingFundsToWinnerAfterTokenExpirationTxLoading ||
              !sendRemainingFundsToWinnerAfterTokenExpiration
            }
            onClick={sendRemainingFundsToWinnerAfterTokenExpiration}
          >
            {sendRemainingFundsToWinnerAfterTokenExpirationTxLoading ? (
              <Spinner />
            ) : (
              "send"
            )}
          </Button>
        </Flex>
      )}
    </>
  );
};
