import { useCallback, useEffect, useMemo, useState } from "react";
import { isAddress } from "viem";
import { useNetwork, usePublicClient } from "wagmi";
import { NULL_ADDRESS } from "../../constants";
import { NETWORKS } from "../../constants/networks";
import { WriteCallbacks } from "../../constants/types";
import { getContract } from "../../utils/contract";
import { useWrite } from "../useWrite";

export const useReadPublic = (creatorTokenAddress: `0x${string}`) => {
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === network.chain?.id);
  }, [network]);
  const contract = getContract("unlonelyArcade", localNetwork);

  const publicClient = usePublicClient();
  const [creatorToken, setCreatorToken] = useState<string>(NULL_ADDRESS);
  const [tokenPrice, setTokenPrice] = useState<bigint>(BigInt(0));
  const [tokenOwner, setTokenOwner] = useState<string>(NULL_ADDRESS);

  const getData = useCallback(async () => {
    if (!contract || !isAddress(creatorTokenAddress) || !publicClient) {
      setCreatorToken(NULL_ADDRESS);
      setTokenPrice(BigInt(0));
      setTokenOwner(NULL_ADDRESS);
      return;
    }
    try {
      const [creatorToken, tokenPrice, tokenOwner] = await Promise.all([
        publicClient.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: "creatorTokens",
          args: [creatorTokenAddress],
        }),
        publicClient.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: "tokenPrices",
          args: [creatorTokenAddress],
        }),
        publicClient.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: "tokenOwners",
          args: [creatorTokenAddress],
        }),
      ]);
      setCreatorToken(creatorToken as unknown as string);
      setTokenPrice(tokenPrice as unknown as bigint);
      setTokenOwner(tokenOwner as unknown as string);
    } catch (error) {
      if (creatorToken !== NULL_ADDRESS) setCreatorToken(NULL_ADDRESS);
      if (tokenPrice !== BigInt(0)) setTokenPrice(BigInt(0));
      if (tokenOwner !== NULL_ADDRESS) setTokenOwner(NULL_ADDRESS);
    }
  }, [contract, creatorTokenAddress, publicClient]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    creatorToken,
    tokenPrice,
    tokenOwner,
  };
};

export const useCalculateEthAmount = (
  creatorTokenAddress: `0x${string}`,
  amountOut: bigint
) => {
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === network.chain?.id);
  }, [network]);
  const contract = getContract("unlonelyArcade", localNetwork);

  const publicClient = usePublicClient();

  const [amountIn, setAmountIn] = useState<bigint>(BigInt(0));

  const getData = useCallback(async () => {
    if (!contract || !isAddress(creatorTokenAddress) || !publicClient) {
      setAmountIn(BigInt(0));
      return;
    }
    try {
      const amountIn = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "calculateEthAmount",
        args: [creatorTokenAddress, amountOut],
      });

      setAmountIn(amountIn as unknown as bigint);
    } catch (error) {
      if (amountIn !== BigInt(0)) setAmountIn(BigInt(0));
    }
  }, [contract, creatorTokenAddress, amountOut]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    amountIn,
  };
};

export const useAdmins = () => {
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === network.chain?.id);
  }, [network]);
  const contract = getContract("unlonelyArcade", localNetwork);

  // if (contract == undefined) return undefined;

  // const { data: danny } = useRead<`0x${string}`>(contract, "danny");
  // const { data: grace } = useRead<`0x${string}`>(contract, "grace");
  // const { data: brian } = useRead<`0x${string}`>(contract, "brian");

  // const admins = useMemo(() => {
  //   if (danny == undefined || grace == undefined || brian == undefined)
  //     return undefined;
  //   return [
  //     danny as `0x${string}`,
  //     grace as `0x${string}`,
  //     brian as `0x${string}`,
  //   ];
  // }, [danny, grace, brian]);

  // return admins;
  const publicClient = usePublicClient();

  const [admins, setAdmins] = useState<string[]>([]);

  const getData = useCallback(async () => {
    if (!contract || !publicClient) {
      setAdmins([]);
      return;
    }
    const admins = await Promise.all([
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "danny",
        args: [],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "grace",
        args: [],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "brian",
        args: [],
      }),
    ]);
    setAdmins(admins as unknown as string[]);
  }, [contract, publicClient]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    admins,
  };
};

export const useBuyCreatorToken = (
  args: {
    creatorTokenAddress: `0x${string}`;
    amountIn: bigint;
    amountOut: bigint;
  },
  callbacks?: WriteCallbacks
) => {
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === network.chain?.id);
  }, [network]);
  const contract = getContract("unlonelyArcade", localNetwork);

  if (contract === undefined)
    return {
      buyCreatorToken: undefined,
      buyCreatorTokenData: undefined,
      buyCreatorTxData: undefined,
      buyCreatorTxLoading: undefined,
    };

  const {
    writeAsync: buyCreatorToken,
    writeData: buyCreatorTokenData,
    txData: buyCreatorTxData,
    isTxLoading: buyCreatorTxLoading,
  } = useWrite(
    contract,
    "buyCreatorToken",
    [args.creatorTokenAddress, args.amountOut],
    callbacks,
    { value: args.amountIn }
  );

  return {
    buyCreatorToken,
    buyCreatorTokenData,
    buyCreatorTxData,
    buyCreatorTxLoading,
  };
};

export const useUseFeature = (
  args: {
    creatorTokenAddress: `0x${string}`;
    featurePrice: bigint;
  },
  callbacks?: WriteCallbacks
) => {
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === network.chain?.id);
  }, [network]);
  const contract = getContract("unlonelyArcade", localNetwork);

  if (contract === undefined)
    return {
      useFeature: undefined,
      useFeatureData: undefined,
      useFeatureTxData: undefined,
      useFeatureTxLoading: undefined,
    };

  const {
    writeAsync: useFeature,
    writeData: useFeatureData,
    txData: useFeatureTxData,
    isTxLoading: useFeatureTxLoading,
  } = useWrite(
    contract,
    "useFeature",
    [args.creatorTokenAddress, args.featurePrice],
    callbacks
  );

  return {
    useFeature,
    useFeatureData,
    useFeatureTxData,
    useFeatureTxLoading,
  };
};

export const useAddCreatorToken = (
  args: {
    creatorTokenAddress: `0x${string}`;
    initialPrice: bigint;
    tokenOwner: `0x${string}`;
  },
  callbacks?: WriteCallbacks
) => {
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === network.chain?.id);
  }, [network]);
  const contract = getContract("unlonelyArcade", localNetwork);

  if (contract === undefined)
    return {
      addCreatorToken: undefined,
      addCreatorTokenData: undefined,
      addCreatorTokenTxData: undefined,
      addCreatorTokenTxLoading: undefined,
    };

  const {
    writeAsync: addCreatorToken,
    writeData: addCreatorTokenData,
    txData: addCreatorTokenTxData,
    isTxLoading: addCreatorTokenTxLoading,
  } = useWrite(
    contract,
    "addCreatorToken",
    [args.creatorTokenAddress, args.initialPrice, args.tokenOwner],
    callbacks
  );

  return {
    addCreatorToken,
    addCreatorTokenData,
    addCreatorTokenTxData,
    addCreatorTokenTxLoading,
  };
};

export const useSetTokenPrice = (
  args: {
    creatorTokenAddress: `0x${string}`;
    price: bigint;
  },
  callbacks?: WriteCallbacks
) => {
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === network.chain?.id);
  }, [network]);
  const contract = getContract("unlonelyArcade", localNetwork);

  if (contract === undefined)
    return {
      setTokenPrice: undefined,
      setTokenPriceData: undefined,
      setTokenPriceTxData: undefined,
      setTokenPriceTxLoading: undefined,
    };

  const {
    writeAsync: setTokenPrice,
    writeData: setTokenPriceData,
    txData: setTokenPriceTxData,
    isTxLoading: setTokenPriceTxLoading,
  } = useWrite(
    contract,
    "setTokenPrice",
    [args.creatorTokenAddress, args.price],
    callbacks
  );

  return {
    setTokenPrice,
    setTokenPriceData,
    setTokenPriceTxData,
    setTokenPriceTxLoading,
  };
};
