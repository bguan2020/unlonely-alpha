import {
  Button,
  Flex,
  Input,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Text,
  Box,
  Spinner,
  Skeleton,
} from "@chakra-ui/react";
import { useRef, useState, useEffect, useCallback } from "react";
import { MdDragIndicator } from "react-icons/md";

import { CLIP_CHANNEL_ID_QUERY_PARAM, NULL_ADDRESS } from "../constants";
import { useRouter } from "next/router";
import useCreateClip from "../hooks/server/channel/useCreateClip";
import useTrimVideo from "../hooks/server/channel/useTrimVideo";
import { WavyText } from "../components/general/WavyText";
import { SplitV1Client, SplitRecipient } from "@0xsplits/splits-sdk";
import {
  createFileBlobAndPinWithPinata,
  pinJsonWithPinata,
} from "../utils/pinata";
import { GET_CHANNEL_BY_ID_QUERY } from "../constants/queries";
import { useLazyQuery } from "@apollo/client";
import { GetChannelByIdQuery, PostNfcInput } from "../generated/graphql";
import Header from "../components/navigation/Header";
import {
  Address,
  Chain,
  HttpTransport,
  PublicClient,
  encodeFunctionData,
  isAddressEqual,
} from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { ExtractAbiFunction, AbiParametersToPrimitiveTypes } from "abitype";
import {
  ContractType,
  createCreatorClient,
  makeMediaTokenMetadata,
} from "@zoralabs/protocol-sdk";
import useUpdateChannelContract1155 from "../hooks/server/channel/useUpdateChannelContract1155";
import { findMostFrequentString } from "../utils/findMostFrequencyString";
import usePostNFC from "../hooks/server/usePostNFC";
import { returnDecodedTopics } from "../utils/contract";

const multicall3Address = "0xcA11bde05977b3631167028862bE2a173976CA11";
const PROTOCOL_ADDRESS = "0x53D6D64945A67658C66730Ff4a038eb298eC8902";

const multicall3Abi = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "target",
            type: "address",
          },
          {
            internalType: "bool",
            name: "allowFailure",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes",
          },
        ],
        internalType: "struct Multicall3.Call3Value[]",
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "aggregate3Value",
    outputs: [
      {
        components: [
          {
            internalType: "bool",
            name: "success",
            type: "bool",
          },
          {
            internalType: "bytes",
            name: "returnData",
            type: "bytes",
          },
        ],
        internalType: "struct Multicall3.Result[]",
        name: "returnData",
        type: "tuple[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
] as const;

const zoraCreator1155Abi = [
  {
    inputs: [
      { internalType: "address", name: "_mintFeeRecipient", type: "address" },
      { internalType: "address", name: "_upgradeGate", type: "address" },
      { internalType: "address", name: "_protocolRewards", type: "address" },
      { internalType: "address", name: "_mints", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "ADDRESS_DELEGATECALL_TO_NON_CONTRACT", type: "error" },
  { inputs: [], name: "ADDRESS_LOW_LEVEL_CALL_FAILED", type: "error" },
  {
    inputs: [
      { internalType: "address", name: "operator", type: "address" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "Burn_NotOwnerOrApproved",
    type: "error",
  },
  { inputs: [], name: "CREATOR_FUNDS_RECIPIENT_NOT_SET", type: "error" },
  {
    inputs: [{ internalType: "bytes", name: "reason", type: "bytes" }],
    name: "CallFailed",
    type: "error",
  },
  { inputs: [], name: "Call_TokenIdMismatch", type: "error" },
  { inputs: [], name: "CallerNotZoraCreator1155", type: "error" },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "quantity", type: "uint256" },
      { internalType: "uint256", name: "totalMinted", type: "uint256" },
      { internalType: "uint256", name: "maxSupply", type: "uint256" },
    ],
    name: "CannotMintMoreTokens",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "proposedAddress", type: "address" },
    ],
    name: "Config_TransferHookNotSupported",
    type: "error",
  },
  {
    inputs: [],
    name: "ERC1155_ACCOUNTS_AND_IDS_LENGTH_MISMATCH",
    type: "error",
  },
  {
    inputs: [],
    name: "ERC1155_ADDRESS_ZERO_IS_NOT_A_VALID_OWNER",
    type: "error",
  },
  { inputs: [], name: "ERC1155_BURN_AMOUNT_EXCEEDS_BALANCE", type: "error" },
  { inputs: [], name: "ERC1155_BURN_FROM_ZERO_ADDRESS", type: "error" },
  {
    inputs: [],
    name: "ERC1155_CALLER_IS_NOT_TOKEN_OWNER_OR_APPROVED",
    type: "error",
  },
  {
    inputs: [],
    name: "ERC1155_ERC1155RECEIVER_REJECTED_TOKENS",
    type: "error",
  },
  {
    inputs: [],
    name: "ERC1155_IDS_AND_AMOUNTS_LENGTH_MISMATCH",
    type: "error",
  },
  {
    inputs: [],
    name: "ERC1155_INSUFFICIENT_BALANCE_FOR_TRANSFER",
    type: "error",
  },
  { inputs: [], name: "ERC1155_MINT_TO_ZERO_ADDRESS", type: "error" },
  { inputs: [], name: "ERC1155_MINT_TO_ZERO_ADDRESS", type: "error" },
  { inputs: [], name: "ERC1155_SETTING_APPROVAL_FOR_SELF", type: "error" },
  {
    inputs: [],
    name: "ERC1155_TRANSFER_TO_NON_ERC1155RECEIVER_IMPLEMENTER",
    type: "error",
  },
  { inputs: [], name: "ERC1155_TRANSFER_TO_ZERO_ADDRESS", type: "error" },
  { inputs: [], name: "ERC1967_NEW_IMPL_NOT_CONTRACT", type: "error" },
  { inputs: [], name: "ERC1967_NEW_IMPL_NOT_UUPS", type: "error" },
  { inputs: [], name: "ERC1967_UNSUPPORTED_PROXIABLEUUID", type: "error" },
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "ETHWithdrawFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "FUNCTION_MUST_BE_CALLED_THROUGH_ACTIVE_PROXY",
    type: "error",
  },
  {
    inputs: [],
    name: "FUNCTION_MUST_BE_CALLED_THROUGH_DELEGATECALL",
    type: "error",
  },
  { inputs: [], name: "FirstMinterAddressZero", type: "error" },
  {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "contractValue", type: "uint256" },
    ],
    name: "FundsWithdrawInsolvent",
    type: "error",
  },
  {
    inputs: [],
    name: "INITIALIZABLE_CONTRACT_ALREADY_INITIALIZED",
    type: "error",
  },
  {
    inputs: [],
    name: "INITIALIZABLE_CONTRACT_IS_NOT_INITIALIZING",
    type: "error",
  },
  { inputs: [], name: "INVALID_ADDRESS_ZERO", type: "error" },
  { inputs: [], name: "INVALID_ETH_AMOUNT", type: "error" },
  {
    inputs: [
      { internalType: "address", name: "mintTo", type: "address" },
      { internalType: "bytes32[]", name: "merkleProof", type: "bytes32[]" },
      { internalType: "bytes32", name: "merkleRoot", type: "bytes32" },
    ],
    name: "InvalidMerkleProof",
    type: "error",
  },
  { inputs: [], name: "InvalidMintSchedule", type: "error" },
  { inputs: [], name: "InvalidMintSchedule", type: "error" },
  { inputs: [], name: "InvalidPremintVersion", type: "error" },
  { inputs: [], name: "InvalidSignature", type: "error" },
  { inputs: [], name: "InvalidSignatureVersion", type: "error" },
  {
    inputs: [{ internalType: "bytes4", name: "magicValue", type: "bytes4" }],
    name: "InvalidSigner",
    type: "error",
  },
  { inputs: [], name: "MintNotYetStarted", type: "error" },
  { inputs: [], name: "Mint_InsolventSaleTransfer", type: "error" },
  { inputs: [], name: "Mint_InvalidMintArrayLength", type: "error" },
  { inputs: [], name: "Mint_TokenIDMintNotAllowed", type: "error" },
  { inputs: [], name: "Mint_UnknownCommand", type: "error" },
  { inputs: [], name: "Mint_ValueTransferFail", type: "error" },
  { inputs: [], name: "MinterContractAlreadyExists", type: "error" },
  { inputs: [], name: "MinterContractDoesNotExist", type: "error" },
  { inputs: [], name: "NewOwnerNeedsToBeAdmin", type: "error" },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "NoRendererForToken",
    type: "error",
  },
  { inputs: [], name: "NonEthRedemption", type: "error" },
  { inputs: [], name: "ONLY_CREATE_REFERRAL", type: "error" },
  { inputs: [], name: "OnlyTransfersFromZoraMints", type: "error" },
  { inputs: [], name: "PremintDeleted", type: "error" },
  {
    inputs: [
      { internalType: "address", name: "caller", type: "address" },
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "ProtocolRewardsWithdrawFailed",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "renderer", type: "address" }],
    name: "RendererNotValid",
    type: "error",
  },
  { inputs: [], name: "Renderer_NotValidRendererContract", type: "error" },
  { inputs: [], name: "SaleEnded", type: "error" },
  { inputs: [], name: "SaleHasNotStarted", type: "error" },
  {
    inputs: [
      { internalType: "address", name: "targetContract", type: "address" },
    ],
    name: "Sale_CannotCallNonSalesContract",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "expected", type: "uint256" },
      { internalType: "uint256", name: "actual", type: "uint256" },
    ],
    name: "TokenIdMismatch",
    type: "error",
  },
  {
    inputs: [],
    name: "UUPS_UPGRADEABLE_MUST_NOT_BE_CALLED_THROUGH_DELEGATECALL",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "limit", type: "uint256" },
      { internalType: "uint256", name: "requestedAmount", type: "uint256" },
    ],
    name: "UserExceedsMintLimit",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "role", type: "uint256" },
    ],
    name: "UserMissingRoleForToken",
    type: "error",
  },
  { inputs: [], name: "WrongValueSent", type: "error" },
  {
    inputs: [],
    name: "premintSignerContractFailedToRecoverSigner",
    type: "error",
  },
  { inputs: [], name: "premintSignerContractNotAContract", type: "error" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "previousAdmin",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newAdmin",
        type: "address",
      },
    ],
    name: "AdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      { indexed: false, internalType: "bool", name: "approved", type: "bool" },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "beacon",
        type: "address",
      },
    ],
    name: "BeaconUpgraded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "updater",
        type: "address",
      },
      {
        indexed: true,
        internalType: "enum IZoraCreator1155.ConfigUpdate",
        name: "updateType",
        type: "uint8",
      },
      {
        components: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "uint96", name: "__gap1", type: "uint96" },
          {
            internalType: "address payable",
            name: "fundsRecipient",
            type: "address",
          },
          { internalType: "uint96", name: "__gap2", type: "uint96" },
          {
            internalType: "contract ITransferHookReceiver",
            name: "transferHook",
            type: "address",
          },
          { internalType: "uint96", name: "__gap3", type: "uint96" },
        ],
        indexed: false,
        internalType: "struct IZoraCreator1155TypesV1.ContractConfig",
        name: "newConfig",
        type: "tuple",
      },
    ],
    name: "ConfigUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "updater",
        type: "address",
      },
      { indexed: false, internalType: "string", name: "uri", type: "string" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
    ],
    name: "ContractMetadataUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract IRenderer1155",
        name: "renderer",
        type: "address",
      },
    ],
    name: "ContractRendererUpdated",
    type: "event",
  },
  { anonymous: false, inputs: [], name: "ContractURIUpdated", type: "event" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "structHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "domainName",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "version",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "CreatorAttribution",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint8", name: "version", type: "uint8" },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "lastOwner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "minter",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "quantity",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Purchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "renderer",
        type: "address",
      },
      { indexed: true, internalType: "address", name: "user", type: "address" },
    ],
    name: "RendererUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "newURI",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxSupply",
        type: "uint256",
      },
    ],
    name: "SetupNewToken",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "ids",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "values",
        type: "uint256[]",
      },
    ],
    name: "TransferBatch",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      { indexed: false, internalType: "uint256", name: "id", type: "uint256" },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "TransferSingle",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "string", name: "value", type: "string" },
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
    ],
    name: "URI",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: true,
        internalType: "uint256",
        name: "permissions",
        type: "uint256",
      },
    ],
    name: "UpdatedPermissions",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        components: [
          {
            internalType: "uint32",
            name: "royaltyMintSchedule",
            type: "uint32",
          },
          { internalType: "uint32", name: "royaltyBPS", type: "uint32" },
          {
            internalType: "address",
            name: "royaltyRecipient",
            type: "address",
          },
        ],
        indexed: false,
        internalType: "struct ICreatorRoyaltiesControl.RoyaltyConfiguration",
        name: "configuration",
        type: "tuple",
      },
    ],
    name: "UpdatedRoyalties",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        components: [
          { internalType: "string", name: "uri", type: "string" },
          { internalType: "uint256", name: "maxSupply", type: "uint256" },
          { internalType: "uint256", name: "totalMinted", type: "uint256" },
        ],
        indexed: false,
        internalType: "struct IZoraCreator1155TypesV1.TokenData",
        name: "tokenData",
        type: "tuple",
      },
    ],
    name: "UpdatedToken",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "Upgraded",
    type: "event",
  },
  {
    inputs: [],
    name: "CONTRACT_BASE_ID",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PERMISSION_BIT_ADMIN",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PERMISSION_BIT_FUNDS_MANAGER",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PERMISSION_BIT_METADATA",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PERMISSION_BIT_MINTER",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PERMISSION_BIT_SALES",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "permissionBits", type: "uint256" },
    ],
    name: "addPermission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "quantity", type: "uint256" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "adminMint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "lastTokenId", type: "uint256" }],
    name: "assumeLastTokenIdMatches",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "uint256", name: "id", type: "uint256" },
    ],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address[]", name: "accounts", type: "address[]" },
      { internalType: "uint256[]", name: "ids", type: "uint256[]" },
    ],
    name: "balanceOfBatch",
    outputs: [
      { internalType: "uint256[]", name: "batchBalances", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "uint256[]", name: "tokenIds", type: "uint256[]" },
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
    ],
    name: "burnBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "callRenderer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      {
        internalType: "contract IMinter1155",
        name: "salesConfig",
        type: "address",
      },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "callSale",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "mintPrice", type: "uint256" },
      { internalType: "uint256", name: "quantity", type: "uint256" },
    ],
    name: "computeTotalReward",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "config",
    outputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "uint96", name: "__gap1", type: "uint96" },
      {
        internalType: "address payable",
        name: "fundsRecipient",
        type: "address",
      },
      { internalType: "uint96", name: "__gap2", type: "uint96" },
      {
        internalType: "contract ITransferHookReceiver",
        name: "transferHook",
        type: "address",
      },
      { internalType: "uint96", name: "__gap3", type: "uint96" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "contractURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "contractVersion",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "createReferrals",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "customRenderers",
    outputs: [
      { internalType: "contract IRenderer1155", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes", name: "premintConfig", type: "bytes" },
      { internalType: "bytes32", name: "premintVersion", type: "bytes32" },
      { internalType: "bytes", name: "signature", type: "bytes" },
      { internalType: "address", name: "firstMinter", type: "address" },
      {
        internalType: "address",
        name: "premintSignerContract",
        type: "address",
      },
    ],
    name: "delegateSetupNewToken",
    outputs: [{ internalType: "uint256", name: "newTokenId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint32", name: "", type: "uint32" }],
    name: "delegatedTokenId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "firstMinters",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getCreatorRewardRecipient",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getCustomRenderer",
    outputs: [
      {
        internalType: "contract IRenderer1155",
        name: "customRenderer",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getRoyalties",
    outputs: [
      {
        components: [
          {
            internalType: "uint32",
            name: "royaltyMintSchedule",
            type: "uint32",
          },
          { internalType: "uint32", name: "royaltyBPS", type: "uint32" },
          {
            internalType: "address",
            name: "royaltyRecipient",
            type: "address",
          },
        ],
        internalType: "struct ICreatorRoyaltiesControl.RoyaltyConfiguration",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getTokenInfo",
    outputs: [
      {
        components: [
          { internalType: "string", name: "uri", type: "string" },
          { internalType: "uint256", name: "maxSupply", type: "uint256" },
          { internalType: "uint256", name: "totalMinted", type: "uint256" },
        ],
        internalType: "struct IZoraCreator1155TypesV1.TokenData",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "implementation",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "contractName", type: "string" },
      { internalType: "string", name: "newContractURI", type: "string" },
      {
        components: [
          {
            internalType: "uint32",
            name: "royaltyMintSchedule",
            type: "uint32",
          },
          { internalType: "uint32", name: "royaltyBPS", type: "uint32" },
          {
            internalType: "address",
            name: "royaltyRecipient",
            type: "address",
          },
        ],
        internalType: "struct ICreatorRoyaltiesControl.RoyaltyConfiguration",
        name: "defaultRoyaltyConfiguration",
        type: "tuple",
      },
      {
        internalType: "address payable",
        name: "defaultAdmin",
        type: "address",
      },
      { internalType: "bytes[]", name: "setupActions", type: "bytes[]" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "role", type: "uint256" },
    ],
    name: "isAdminOrRole",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "address", name: "operator", type: "address" },
    ],
    name: "isApprovedForAll",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "metadataRendererContract",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "contract IMinter1155", name: "minter", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "quantity", type: "uint256" },
      {
        internalType: "address[]",
        name: "rewardsRecipients",
        type: "address[]",
      },
      { internalType: "bytes", name: "minterArguments", type: "bytes" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "mintFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256[]", name: "mintTokenIds", type: "uint256[]" },
      { internalType: "uint256[]", name: "quantities", type: "uint256[]" },
      { internalType: "contract IMinter1155", name: "minter", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      {
        internalType: "address[]",
        name: "rewardsRecipients",
        type: "address[]",
      },
      { internalType: "bytes", name: "minterArguments", type: "bytes" },
    ],
    name: "mintWithMints",
    outputs: [
      { internalType: "uint256", name: "quantityMinted", type: "uint256" },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "contract IMinter1155", name: "minter", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "quantity", type: "uint256" },
      { internalType: "bytes", name: "minterArguments", type: "bytes" },
      { internalType: "address", name: "mintReferral", type: "address" },
    ],
    name: "mintWithRewards",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes[]", name: "data", type: "bytes[]" }],
    name: "multicall",
    outputs: [{ internalType: "bytes[]", name: "results", type: "bytes[]" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextTokenId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256[]", name: "", type: "uint256[]" },
      { internalType: "uint256[]", name: "", type: "uint256[]" },
      { internalType: "bytes", name: "", type: "bytes" },
    ],
    name: "onERC1155BatchReceived",
    outputs: [{ internalType: "bytes4", name: "", type: "bytes4" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "bytes", name: "", type: "bytes" },
    ],
    name: "onERC1155Received",
    outputs: [{ internalType: "bytes4", name: "", type: "bytes4" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "permissions",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "permissionBits", type: "uint256" },
    ],
    name: "removePermission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "royalties",
    outputs: [
      { internalType: "uint32", name: "royaltyMintSchedule", type: "uint32" },
      { internalType: "uint32", name: "royaltyBPS", type: "uint32" },
      { internalType: "address", name: "royaltyRecipient", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "salePrice", type: "uint256" },
    ],
    name: "royaltyInfo",
    outputs: [
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "uint256", name: "royaltyAmount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256[]", name: "ids", type: "uint256[]" },
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "safeBatchTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "operator", type: "address" },
      { internalType: "bool", name: "approved", type: "bool" },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "fundsRecipient",
        type: "address",
      },
    ],
    name: "setFundsRecipient",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "setOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      {
        internalType: "contract IRenderer1155",
        name: "renderer",
        type: "address",
      },
    ],
    name: "setTokenMetadataRenderer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ITransferHookReceiver",
        name: "transferHook",
        type: "address",
      },
    ],
    name: "setTransferHook",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "newURI", type: "string" },
      { internalType: "uint256", name: "maxSupply", type: "uint256" },
    ],
    name: "setupNewToken",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "newURI", type: "string" },
      { internalType: "uint256", name: "maxSupply", type: "uint256" },
      { internalType: "address", name: "createReferral", type: "address" },
    ],
    name: "setupNewTokenWithCreateReferral",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "supportedPremintSignatureVersions",
    outputs: [{ internalType: "string[]", name: "", type: "string[]" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_newURI", type: "string" },
      { internalType: "string", name: "_newName", type: "string" },
    ],
    name: "updateContractMetadata",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "address", name: "recipient", type: "address" },
    ],
    name: "updateCreateReferral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      {
        components: [
          {
            internalType: "uint32",
            name: "royaltyMintSchedule",
            type: "uint32",
          },
          { internalType: "uint32", name: "royaltyBPS", type: "uint32" },
          {
            internalType: "address",
            name: "royaltyRecipient",
            type: "address",
          },
        ],
        internalType: "struct ICreatorRoyaltiesControl.RoyaltyConfiguration",
        name: "newConfiguration",
        type: "tuple",
      },
    ],
    name: "updateRoyaltiesForToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "string", name: "_newURI", type: "string" },
    ],
    name: "updateTokenURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "newImplementation", type: "address" },
    ],
    name: "upgradeTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "newImplementation", type: "address" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "uri",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
];

type Aggregate3ValueFunction = ExtractAbiFunction<
  typeof multicall3Abi,
  "aggregate3Value"
>["inputs"];
type Aggregate3ValueCall =
  AbiParametersToPrimitiveTypes<Aggregate3ValueFunction>[0][0];

const Clip = () => {
  const router = useRouter();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient({
    onSuccess(data) {
      console.log("Success", data);
    },
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  const [clipRange, setClipRange] = useState<[number, number]>([0, 0]);
  const [title, setTitle] = useState("");
  const [channelId, setChannelId] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number>(8453);
  const [roughClipUrl, setRoughClipUrl] = useState(
    ""
    // "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/a5e1mb4vfge22uvr/1200p0.mp4"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [
    getChannelById,
    {
      loading: getChannelByIdLoading,
      data: getChannelByIdData,
      error: getChannelByIdError,
    },
  ] = useLazyQuery<GetChannelByIdQuery>(GET_CHANNEL_BY_ID_QUERY, {
    variables: { id: channelId },
    fetchPolicy: "network-only",
  });

  const { createClip } = useCreateClip({
    onError: (e) => {
      console.log(e);
    },
  });

  const { trimVideo } = useTrimVideo({
    onError: () => {
      console.log("Error");
    },
  });

  const { updateChannelContract1155 } = useUpdateChannelContract1155({
    onError: () => {
      console.log("Error");
    },
  });

  const { postNFC } = usePostNFC({
    onError: () => {
      console.log("Error");
    },
  });

  useEffect(() => {
    const init = async () => {
      if (router.query[CLIP_CHANNEL_ID_QUERY_PARAM])
        setChannelId(router.query[CLIP_CHANNEL_ID_QUERY_PARAM] as string);
    };
    init();
  }, [router]);

  useEffect(() => {
    if (channelId) getChannelById();
  }, [channelId]);

  useEffect(() => {
    const init = async () => {
      if (!getChannelByIdData) return;
      setIsLoading(true);
      try {
        const { res } = await createClip({
          title: `rough-clip-${Date.now()}`,
          channelId: getChannelByIdData.getChannelById?.id,
          livepeerPlaybackId:
            getChannelByIdData.getChannelById?.livepeerPlaybackId,
          noDatabasePush: true,
        });
        const url = res?.url;
        if (url) {
          setRoughClipUrl(url);
        } else {
          console.log("Error, url is missing");
        }
      } catch (e) {}
      setIsLoading(false);
    };
    init();
  }, [getChannelByIdData]);

  useEffect(() => {
    if (roughClipUrl && videoRef.current) {
      videoRef.current.load();
      videoRef.current.onloadedmetadata = () => {
        setClipRange([0, videoRef.current?.duration || 0]);
      };
    }
  }, [roughClipUrl]);

  const handleRangeChange = (range: [number, number]) => {
    setClipRange(range);
    if (videoRef.current) {
      videoRef.current.currentTime = range[0];
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      if (currentTime >= clipRange[1]) {
        videoRef.current.currentTime = clipRange[0];
      }
    }
  };

  const handleSeeking = () => {
    if (videoRef.current) {
      if (videoRef.current.currentTime < clipRange[0]) {
        videoRef.current.currentTime = clipRange[0];
      }
    }
  };

  const handleTrimVideo = useCallback(async () => {
    if (
      !roughClipUrl ||
      !channelId ||
      clipRange[0] >= clipRange[1] ||
      !getChannelByIdData ||
      !chainId ||
      !walletClient?.account.address ||
      !getChannelByIdData?.getChannelById?.owner?.address
    )
      return;
    const initiallyCheckedContract1155Address = getChannelByIdData
      ?.getChannelById?.contract1155Address as `0x${string}` | undefined | null;
    const res = await trimVideo({
      startTime: clipRange[0],
      endTime: clipRange[1],
      videoLink: roughClipUrl,
      name: title,
      channelId: channelId ?? "",
    });

    // CREATE TOKEN METADATA

    const { pinRes: videoFileIpfsUrl } = await createFileBlobAndPinWithPinata(
      String(res?.res?.videoLink),
      "video.mp4",
      "video/mp4"
    );
    console.log("videoFileIpfsUrl", videoFileIpfsUrl);
    if (!videoFileIpfsUrl || !res?.res?.videoLink) return;

    const { file: thumbnailFile, pinRes: thumbnailFileIpfsUrl } =
      await createFileBlobAndPinWithPinata(
        String(res?.res?.videoThumbnail),
        title,
        "image/png"
      );
    if (!thumbnailFileIpfsUrl || !thumbnailFile || !res?.res?.videoThumbnail)
      return;

    console.log("thumbnailFileIpfsUrl", thumbnailFileIpfsUrl);

    const tokenMetadataJson = await makeMediaTokenMetadata({
      mediaUrl: videoFileIpfsUrl,
      thumbnailUrl: thumbnailFileIpfsUrl,
      name: thumbnailFile.name,
    });
    console.log("makeMediaTokenMetadata tokenMetadataJson", tokenMetadataJson);

    const jsonMetadataUri = await pinJsonWithPinata(tokenMetadataJson);
    console.log("jsonMetadataUri", jsonMetadataUri);

    // CREATE SPLIT CONFIG

    const { agregate3Calls, predicted, error, splitCallData, splitAddress } =
      await handleSplitConfig();
    if (error) return;

    // CHECK IF CONTRACT EXISTS AT THIS POINT IN TIME, IF SO USE IT

    let subsequentCheckedContract1155Address: string | null | undefined = null;

    if (!initiallyCheckedContract1155Address) {
      const newChannelData = await getChannelById();
      subsequentCheckedContract1155Address =
        newChannelData?.data?.getChannelById?.contract1155Address;
      console.log("existing contract", subsequentCheckedContract1155Address);
    }

    let contractObject: ContractType = {
      name: "",
      uri: "",
    };
    let tokenObject: any = {
      tokenMetadataURI: jsonMetadataUri,
      payoutRecipient: predicted.splitAddress,
    };

    if (
      !initiallyCheckedContract1155Address &&
      !subsequentCheckedContract1155Address
    ) {
      tokenObject = {
        tokenMetadataURI: jsonMetadataUri,
        payoutRecipient: predicted.splitAddress,
        mintToCreatorCount: 1,
      };
      const _contractMetadataJsonUri = await pinJsonWithPinata({
        description: `this was clipped from ${getChannelByIdData?.getChannelById?.slug}'s Unlonely livestream`,
        image: videoFileIpfsUrl,
        name: title,
      });
      contractObject = {
        name: `${getChannelByIdData?.getChannelById?.slug}-Unlonely-Clips`,
        uri: _contractMetadataJsonUri,
      };
    } else if (initiallyCheckedContract1155Address) {
      contractObject = initiallyCheckedContract1155Address;
    } else if (subsequentCheckedContract1155Address) {
      contractObject = subsequentCheckedContract1155Address as `0x${string}`;
    } else {
      console.log("no satisfactory outcome found");
      return;
    }

    console.log("contractObject", contractObject);
    console.log("tokenObject", tokenObject);

    // CREATE 1155 CONTRACT AND TOKEN

    const creatorClient = createCreatorClient({ chainId, publicClient });
    const { parameters } = await creatorClient.create1155({
      contract: contractObject,
      token: tokenObject,
      account: walletClient?.account.address as Address,
    });

    console.log("parameters from create1155", parameters);

    let freqAddress: `0x${string}` = NULL_ADDRESS;
    let tokenId = -1;
    if (predicted.splitExists) {
      const transaction = await handleWriteCreate1155(parameters);
      const logs = transaction?.logs ?? [];
      console.log("transaction logs", logs);
      // freqAddress is the address of the 1155 contract
      const _freqAddress = findMostFrequentString(
        logs.map((log) => log.address)
      );

      console.log("freqAddress", freqAddress);
      freqAddress = _freqAddress as `0x${string}`;

      const topics = returnDecodedTopics(
        logs,
        zoraCreator1155Abi as any[],
        "UpdatedToken",
        false
      );

      console.log("create1155 topics and split exists", topics);
      if (topics) {
        const args: any = topics.args;
        const _tokenId: bigint = args.tokenId;
        console.log("tokenId", _tokenId);
        tokenId = Number(_tokenId);
      }
    } else {
      if (typeof contractObject === "string") {
        if (splitCallData && splitAddress && walletClient?.account.address) {
          const splitCreationHash = await walletClient.sendTransaction({
            to: splitAddress as Address,
            account: walletClient?.account.address as Address,
            data: splitCallData,
          });
          if (!splitCreationHash) return;
          const splitTransaction = await publicClient.waitForTransactionReceipt(
            {
              hash: splitCreationHash,
            }
          );
          const splitLogs = splitTransaction?.logs;
          console.log("splitTransaction logs", splitLogs);

          const transaction = await handleWriteCreate1155(parameters);
          const logs = transaction?.logs ?? [];
          console.log("transaction logs", logs);

          const _freqAddress = findMostFrequentString(
            logs.map((log) => log.address)
          );

          console.log("freqAddress", freqAddress);
          freqAddress = _freqAddress as `0x${string}`;

          const topics = returnDecodedTopics(
            logs,
            zoraCreator1155Abi,
            "UpdatedToken",
            false
          );

          if (topics) {
            const args: any = topics.args;
            const _tokenId: bigint = args.tokenId;
            console.log("tokenId", _tokenId);
            tokenId = Number(_tokenId);
          }

          console.log("create1155 topics", topics);
        }
      } else {
        // push 1155 contract and token creation calls to the multicall3 aggregate call
        agregate3Calls.push({
          allowFailure: false,
          value: parameters.value || BigInt(0),
          target: parameters.address,
          callData: encodeFunctionData({
            abi: parameters.abi,
            functionName: parameters.functionName,
            args: parameters.args,
          }),
        });

        console.log("agregate3Calls", agregate3Calls);

        // simulate the transaction multicall 3 transaction
        const { request } = await publicClient.simulateContract({
          abi: multicall3Abi,
          functionName: "aggregate3Value",
          address: multicall3Address,
          args: [agregate3Calls],
          account: walletClient?.account.address as Address,
        });

        console.log("simulated multicall3 request", request);

        // execute the transaction
        const hash = await walletClient
          ?.writeContract(request)
          .then((response) => {
            console.log("multicall3 response", response);
            return response;
          });

        if (hash) {
          const transaction = await publicClient.waitForTransactionReceipt({
            hash,
          });
          const logs = transaction.logs;
          console.log("multicall tx logs", logs);
          // freqAddress is the address of the 1155 contract
          const _freqAddress = findMostFrequentString(
            logs.map((log) => log.address)
          );

          const topics = returnDecodedTopics(
            logs,
            zoraCreator1155Abi,
            "UpdatedToken",
            false
          );

          console.log("multicall topics", topics);

          console.log("freqAddress", _freqAddress);
          freqAddress = _freqAddress as `0x${string}`;

          if (topics) {
            const args: any = topics.args;
            const _tokenId: bigint = args.tokenId;
            console.log("tokenId", _tokenId);
            tokenId = Number(_tokenId);
          }
        }
      }
    }
    if (freqAddress && channelId) {
      await updateChannelContract1155({
        channelId: channelId,
        contract1155Address: freqAddress,
        contract1155ChainId: chainId,
      });
    }

    const postNfcObject: PostNfcInput = {
      title: title,
      videoLink: res?.res?.videoLink,
      videoThumbnail: res?.res?.videoThumbnail,
      openseaLink: "",
      channelId: channelId,
      contract1155Address: freqAddress,
      zoraLink: `https://zora.co/collect/base:${freqAddress}/${tokenId}`,
      tokenId: Number(tokenId),
    };
    console.log("postNfcObject", postNfcObject);
    await postNFC(postNfcObject);
  }, [
    roughClipUrl,
    clipRange,
    title,
    channelId,
    getChannelByIdData,
    chainId,
    publicClient,
    walletClient,
  ]);

  const handleSplitConfig = async () => {
    const agregate3Calls: Aggregate3ValueCall[] = [];
    if (!publicClient || !walletClient?.account.address)
      return {
        agregate3Calls,
        predicted: {
          splitAddress: NULL_ADDRESS as Address,
          splitExists: false,
        },
        splitCallData: null,
        splitAddress: null,
        error: true,
      };
    const splitsClient = new SplitV1Client({
      chainId,
      publicClient: publicClient as PublicClient<HttpTransport, Chain>,
      apiConfig: {
        apiKey: String(process.env.NEXT_PUBLIC_SPLITS_API_KEY),
      },
    });

    const userSplitRecipients = isAddressEqual(
      walletClient?.account.address,
      getChannelByIdData?.getChannelById?.owner?.address as `0x${string}`
    )
      ? [
          {
            address: walletClient?.account.address as Address,
            percentAllocation: 90,
          },
        ]
      : [
          {
            address: walletClient?.account.address as Address,
            percentAllocation: 45,
          },
          {
            address: getChannelByIdData?.getChannelById?.owner
              ?.address as Address,
            percentAllocation: 45,
          },
        ];

    // configure the split
    const splitsConfig: {
      recipients: SplitRecipient[];
      distributorFeePercent: number;
    } = {
      recipients: [
        ...userSplitRecipients,
        {
          address: PROTOCOL_ADDRESS,
          percentAllocation: 10,
        },
      ],
      distributorFeePercent: 0,
    };

    const predicted = await splitsClient.predictImmutableSplitAddress(
      splitsConfig
    );

    console.log("predicted", predicted);

    let splitCallData = null;
    let splitAddress = null;
    if (!predicted.splitExists) {
      // if the split has not been created, add a call to create it
      // to the multicall3 aggregate call

      const { data, address } = await splitsClient.callData.createSplit(
        splitsConfig
      );
      splitCallData = data;
      splitAddress = address;
      agregate3Calls.push({
        allowFailure: false,
        callData: data,
        target: address as Address,
        value: BigInt(0),
      });
    }
    return {
      agregate3Calls,
      predicted,
      splitCallData,
      splitAddress,
      error: false,
    };
  };

  const handleWriteCreate1155 = async (parameters: any) => {
    if (!publicClient || !walletClient?.account.address) return;
    const { request } = await publicClient.simulateContract(parameters);

    // execute the transaction
    const hash = await walletClient.writeContract(request);
    if (!hash) return;
    const transaction = await publicClient.waitForTransactionReceipt({
      hash,
    });
    return transaction;
  };

  return (
    <Flex h="100vh" bg="rgba(5, 0, 31, 1)" direction={"column"}>
      <Header />
      <Flex p="20" justifyContent={"center"}>
        <Flex flexDirection={"column"} gap="10px">
          {roughClipUrl ? (
            <video
              ref={videoRef}
              src={roughClipUrl.concat("#t=0.1")}
              style={{
                height: "500px",
              }}
              onTimeUpdate={handleTimeUpdate}
              onSeeking={handleSeeking}
              controls
              onEnded={() => {
                videoRef.current!.currentTime = clipRange[0];
                videoRef.current!.play();
              }}
            />
          ) : (
            <>
              <Flex fontSize="20px" justifyContent={"center"}>
                <WavyText
                  text="creating rough clip, please wait..."
                  modifier={0.008}
                />
              </Flex>
              <Skeleton
                startColor="#575757"
                endColor="#b2b2b2ff"
                height={"500px"}
                width={"80vh"}
              ></Skeleton>
              <Skeleton
                startColor="#575757"
                endColor="#b2b2b2ff"
                height={"100px"}
                width={"80vh"}
              ></Skeleton>
              <Skeleton
                startColor="#575757"
                endColor="#b2b2b2ff"
                height={"50px"}
                width={"80vh"}
              ></Skeleton>
              <Skeleton
                startColor="#575757"
                endColor="#b2b2b2ff"
                height={"50px"}
                width={"80vh"}
              ></Skeleton>
            </>
          )}
          {roughClipUrl && (
            <>
              <RangeSlider
                aria-label={["min", "max"]}
                defaultValue={[0, 100]}
                min={0}
                max={videoRef.current?.duration || 100}
                value={clipRange}
                onChange={handleRangeChange}
              >
                <RangeSliderTrack height="40px" backgroundColor="#414141">
                  <RangeSliderFilledTrack color={"#343dbb"} />
                </RangeSliderTrack>
                <RangeSliderThumb height={"40px"} borderRadius={0} index={0}>
                  <MdDragIndicator color={"#343dbb"} size={"40"} />
                </RangeSliderThumb>
                <RangeSliderThumb height={"40px"} borderRadius={0} index={1}>
                  <MdDragIndicator color={"#343dbb"} size={"40"} />
                </RangeSliderThumb>
              </RangeSlider>
              <Input
                variant="glow"
                placeholder={"title"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Button
                position="relative"
                onClick={() => {
                  if (title) handleTrimVideo();
                }}
                isDisabled={!title}
              >
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  height="100%"
                  bg="green.400"
                  zIndex="1"
                />
                <Text position="relative" zIndex="2" width="100%">
                  {isLoading ? <Spinner /> : "Send to publish"}
                </Text>
              </Button>
            </>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
export default Clip;
