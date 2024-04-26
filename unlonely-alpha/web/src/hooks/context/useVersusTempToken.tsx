import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { ContractData } from "../../constants/types";
import {
  UseReadTempTokenTxsType,
  useReadTempTokenTxs,
  useReadTempTokenTxsInitial,
} from "../internal/temp-token/read/useReadTempTokenTxs";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { useNetworkContext } from "./useNetwork";
import { NULL_ADDRESS } from "../../constants";

type VersusTokenDataType = {
  symbol: string;
  address: string;
  totalSupply: bigint;
  isAlwaysTradeable: boolean;
  highestTotalSupply: bigint;
  contractData: ContractData;
  creationBlockNumber: bigint;
  endTimestamp?: bigint;
};

type ReadVersusTokenDataType = VersusTokenDataType & UseReadTempTokenTxsType;

export const versusTokenDataInitial: VersusTokenDataType = {
  symbol: "",
  address: "",
  totalSupply: BigInt(0),
  isAlwaysTradeable: false,
  highestTotalSupply: BigInt(0),
  contractData: {
    address: NULL_ADDRESS,
    chainId: 0,
    abi: undefined,
  },
  creationBlockNumber: BigInt(0),
  endTimestamp: BigInt(0),
};

export const useVersusTempTokenContext = () => {
  return useContext(VersusTempTokenContext);
};

const VersusTempTokenContext = createContext<{
  gameState: {
    canPlayToken: boolean;
    focusedTokenToTrade: ContractData | undefined;
    isGameFinished: boolean;
    isGameFinishedModalOpen: boolean;
    handleCanPlayToken: (value: boolean) => void;
    handleIsGameFinished: (value: boolean) => void;
    handleIsGameFinishedModalOpen: (value: boolean) => void;
    handleFocusedTokenToTrade: (value: ContractData | undefined) => void;
  };
  tokenA: ReadVersusTokenDataType;
  tokenB: ReadVersusTokenDataType;
}>({
  gameState: {
    canPlayToken: false,
    focusedTokenToTrade: undefined,
    isGameFinished: false,
    isGameFinishedModalOpen: false,
    handleCanPlayToken: () => undefined,
    handleIsGameFinished: () => undefined,
    handleIsGameFinishedModalOpen: () => undefined,
    handleFocusedTokenToTrade: () => undefined,
  },
  tokenA: { ...versusTokenDataInitial, ...useReadTempTokenTxsInitial },
  tokenB: { ...versusTokenDataInitial, ...useReadTempTokenTxsInitial },
});

export const VersusTempTokenProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const [canPlayToken, setCanPlayToken] = useState(false);
  const [focusedTokenToTrade, setFocusedTokenToTrade] = useState<
    ContractData | undefined
  >(undefined);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [isGameFinishedModalOpen, setIsGameFinishedModalOpen] = useState(false);
  const [tokenA, setTokenA] = useState<VersusTokenDataType>(
    versusTokenDataInitial
  );
  const [tokenB, setTokenB] = useState<VersusTokenDataType>(
    versusTokenDataInitial
  );

  const tempTokenContract_a: ContractData = useMemo(() => {
    if (tokenA) {
      return {
        address: tokenA.address as `0x${string}`,
        abi: tokenA.contractData.abi,
        chainId: localNetwork.config.chainId,
      };
    } else {
      return {
        address: NULL_ADDRESS,
        chainId: localNetwork.config.chainId,
        abi: undefined,
      };
    }
  }, [tokenA, localNetwork.config.chainId]);

  const tempTokenContract_b: ContractData = useMemo(() => {
    if (tokenB) {
      return {
        address: tokenB.address as `0x${string}`,
        abi: tokenB.contractData.abi,
        chainId: localNetwork.config.chainId,
      };
    } else {
      return {
        address: NULL_ADDRESS,
        chainId: localNetwork.config.chainId,
        abi: undefined,
      };
    }
  }, [tokenB, localNetwork.config.chainId]);

  const baseClient = useMemo(
    () =>
      createPublicClient({
        chain: base,
        transport: http(
          "https://base-mainnet.g.alchemy.com/v2/aR93M6MdEC4lgh4VjPXLaMnfBveve1fC"
        ),
      }),
    []
  );

  const handleCanPlayToken = useCallback((value: boolean) => {
    setCanPlayToken(value);
  }, []);

  const handleFocusedTokenToTrade = useCallback(
    (value: ContractData | undefined) => {
      setFocusedTokenToTrade(value);
    },
    []
  );

  const handleIsGameFinished = useCallback((value: boolean) => {
    setIsGameFinished(value);
  }, []);

  const handleIsGameFinishedModalOpen = useCallback((value: boolean) => {
    setIsGameFinishedModalOpen(value);
  }, []);

  /**
   * functions to run when specific events are detected, not exposed outside of this hook,
   */
  const onMintEvent = useCallback(
    async (
      totalSupply: bigint,
      highestTotalSupply: bigint,
      tokenIdentifier: "a" | "b"
    ) => {
      if (tokenIdentifier === "a") {
        setTokenA((prevTokenA) => {
          if (prevTokenA) {
            return {
              ...prevTokenA,
              totalSupply,
              highestTotalSupply,
            };
          } else {
            return prevTokenA;
          }
        });
      } else if (tokenIdentifier === "b") {
        setTokenB((prevTokenB) => {
          if (prevTokenB) {
            return {
              ...prevTokenB,
              totalSupply,
              highestTotalSupply,
            };
          } else {
            return prevTokenB;
          }
        });
      }
    },
    []
  );

  const onBurnEvent = useCallback(
    async (totalSupply: bigint, tokenIdentifier: "a" | "b") => {
      if (tokenIdentifier === "a") {
        setTokenA((prevTokenA) => {
          if (prevTokenA) {
            return {
              ...prevTokenA,
              totalSupply,
            };
          } else {
            return prevTokenA;
          }
        });
      } else if (tokenIdentifier === "b") {
        setTokenB((prevTokenB) => {
          if (prevTokenB) {
            return {
              ...prevTokenB,
              totalSupply,
            };
          } else {
            return prevTokenB;
          }
        });
      }
    },
    []
  );

  const readTempTokenTxs_a = useReadTempTokenTxs({
    tokenCreationBlockNumber: tokenA?.creationBlockNumber ?? BigInt(0),
    tokenSymbol: tokenA?.symbol ?? "",
    baseClient,
    tempTokenContract: tempTokenContract_a,
    onMintCallback: (totalSupply: bigint, highestTotalSupply: bigint) =>
      onMintEvent(totalSupply, highestTotalSupply, "a"),
    onBurnCallback: (totalSupply: bigint) => onBurnEvent(totalSupply, "a"),
  });

  const readTempTokenTxs_b = useReadTempTokenTxs({
    tokenCreationBlockNumber: tokenB?.creationBlockNumber ?? BigInt(0),
    tokenSymbol: tokenB?.symbol ?? "",
    baseClient,
    tempTokenContract: tempTokenContract_b,
    onMintCallback: (totalSupply: bigint, highestTotalSupply: bigint) =>
      onMintEvent(totalSupply, highestTotalSupply, "b"),
    onBurnCallback: (totalSupply: bigint) => onBurnEvent(totalSupply, "b"),
  });

  const value = useMemo(
    () => ({
      gameState: {
        canPlayToken,
        focusedTokenToTrade,
        isGameFinished,
        isGameFinishedModalOpen,
        handleCanPlayToken,
        handleFocusedTokenToTrade,
        handleIsGameFinished,
        handleIsGameFinishedModalOpen,
      },
      tokenA: {
        ...tokenA,
        ...readTempTokenTxs_a,
      },
      tokenB: {
        ...tokenB,
        ...readTempTokenTxs_b,
      },
    }),
    [
      canPlayToken,
      focusedTokenToTrade,
      isGameFinished,
      isGameFinishedModalOpen,
      tokenA,
      tokenB,
      readTempTokenTxs_a,
      readTempTokenTxs_b,
      handleCanPlayToken,
      handleFocusedTokenToTrade,
      handleIsGameFinished,
      handleIsGameFinishedModalOpen,
    ]
  );

  return (
    <VersusTempTokenContext.Provider value={value}>
      {children}
    </VersusTempTokenContext.Provider>
  );
};
