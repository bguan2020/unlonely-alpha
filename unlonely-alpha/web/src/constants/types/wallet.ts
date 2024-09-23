import { MessageSignerWalletAdapterProps, SignerWalletAdapterProps, WalletAdapterProps } from "@solana/wallet-adapter-base";


// This is a manual re-creation of the types from the privy's solana packages because I ran into typescript and project compatibility issues trying to import them

export interface ConnectedSolanaWallet extends BaseConnectedSolanaWallet, PrivyConnectedWallet {
}

interface SolanaProvider {
    request: (request: {
        method: string;
        params?: any;
    }) => Promise<any>;
}

/**
 * These types are fully compatible with WAGMI chain types, in case
 * we need interop in the future.
 */
type RpcUrls = {
    http: readonly string[];
    webSocket?: readonly string[];
};
type NativeCurrency = {
    name: string;
    /** 2-6 characters long */
    symbol: string;
    decimals: number;
};
type BlockExplorer = {
    name: string;
    url: string;
};

interface BaseConnectedSolanaWallet extends BaseConnectedWallet {
    /**
     * Returns a light provider for interfacing with this wallet. Support message signing
     * on embedded and external wallets using an internal interface.
     */
    getProvider: () => Promise<SolanaProvider>;
    signMessage: MessageSignerWalletAdapterProps["signMessage"] | undefined;
    sendTransaction: WalletAdapterProps["sendTransaction"] | undefined;
    signTransaction: SignerWalletAdapterProps["signTransaction"] | undefined;
}

/**
 * Accepted payment methods for the MoonPay fiat on-ramp.
 */
type MoonpayPaymentMethod = "ach_bank_transfer" | "credit_debit_card" | "gbp_bank_transfer" | "gbp_open_banking_payment" | "mobile_wallet" | "sepa_bank_transfer" | "sepa_open_banking_payment" | "pix_instant_payment" | "yellow_card_bank_transfer";
type MoonpayUiConfig = {
    accentColor?: string;
    theme?: "light" | "dark";
};
/**
 * Cryptocurrency codes for the MoonPay fiat on-ramp. These codes
 * follow the format {TOKEN_NAME}_{NETWORK_NAME}.
 */
type MoonpayCurrencyCode = "AVAX_CCHAIN" | "CELO_CELO" | "CUSD_CELO" | "DAI_ETHEREUM" | "ETH_ETHEREUM" | "ETH_ARBITRUM" | "ETH_POLYGON" | "ETH_BASE" | "FIL_FVM" | "MATIC_ETHEREUM" | "MATIC_POLYGON" | "USDC_ETHEREUM" | "USDC_ARBITRUM" | "USDC_OPTIMISM" | "USDC_POLYGON" | "USDC_BASE" | "USDT_ETHEREUM" | "USDT_POLYGON" | "WETH_POLYGON" | "WBTC_ETHEREUM" | "BNB_BNB" | "BNB_BSC";
/**
 * Configuration parameter for the MoonPay fiat on-ramp.
 */
type MoonpayConfig = {
    currencyCode?: MoonpayCurrencyCode;
    quoteCurrencyAmount?: number;
    paymentMethod?: MoonpayPaymentMethod;
    uiConfig?: MoonpayUiConfig;
};

type Chain = {
    /** Id in number form */
    id: number;
    /** Human readable name */
    name: string;
    /** Internal network name */
    network?: string;
    /** Currency used by chain */
    nativeCurrency: NativeCurrency;
    /** Collection of block explorers */
    blockExplorers?: {
        [key: string]: BlockExplorer;
        default: BlockExplorer;
    };
    /** Collection of RPC endpoints */
    rpcUrls: {
        [key: string]: RpcUrls;
        default: RpcUrls;
    } | {
        [key: string]: RpcUrls;
        default: RpcUrls;
        /** @optional Allows you to override the RPC url for this chain */
        privyWalletOverride: RpcUrls;
    };
    /** Flag for test networks */
    testnet?: boolean;
};

type MoonpayFundingConfig = {
    config: MoonpayConfig;
    provider?: "moonpay";
};
/**
 * Configuration for native funding amount.
 */
type NativeFundingConfig = {
    chain?: Chain;
    amount?: string;
} | {
    chain?: Chain;
    amount: string;
    asset: {
        erc20: `0x${string}`;
    } | "USDC" | "native-currency";
};
/**
 * Optional configuration parameter for the fiat on-ramp.
 */
type FundWalletConfig = MoonpayFundingConfig | NativeFundingConfig;

interface PrivyConnectedWallet {
    /** True if this wallet is linked to the authenticated user. False if it is not yet linked or
     * the user has not yet authenticated. */
    linked: boolean;
    /** Login with this wallet or link this wallet to the authenticated user.
     *
     * Throws a PrivyClientError if the wallet is not connected.
     */
    loginOrLink: () => Promise<void>;
    /**
     * Prompt the user to go through the funding flow and for the connected wallet.
     *
     * This will open the modal with a prompt for the user to select a funding method (if multiple are enabled).
     *
     * Once the user continues to the funding flow, Privy will display the funding status screen, and wait
     * for the transaction to complete.
     *
     * Note: Even after a successful funding, funds can take a few minutes to arrive in the user"s wallet.
     *
     * Privy currently supports funding via external wallets and Moonpay.
     *
     *  @param {FundWalletConfig} fundWalletConfig Funding configuration to specify chain and funding amount (if enabled)
     * **/
    fund: (fundWalletConfig?: FundWalletConfig) => Promise<void>;
    /** Unlink this wallet to the authenticated user. Throws a PrivyClientError if the user is not
     * authenticated. */
    unlink: () => Promise<void>;
}

declare const EMBEDDED_WALLET_CLIENT_TYPES: readonly ["privy"];
type EmbeddedWalletClientType = (typeof EMBEDDED_WALLET_CLIENT_TYPES)[number];
declare const INJECTED_WALLET_CLIENT_TYPES: readonly ["metamask", "phantom", "brave_wallet", "rainbow", "uniswap_wallet_extension", "uniswap_extension", "rabby_wallet", "crypto.com_wallet_extension"];
type InjectedWalletClientType = (typeof INJECTED_WALLET_CLIENT_TYPES)[number];
declare const COINBASE_WALLET_CLIENT_TYPES: readonly ["coinbase_wallet", "coinbase_smart_wallet"];
type CoinbaseWalletClientType = (typeof COINBASE_WALLET_CLIENT_TYPES)[number];
declare const WALLET_CONNECT_WALLET_CLIENT_TYPES: [number];
type WalletConnectWalletClientType = (typeof WALLET_CONNECT_WALLET_CLIENT_TYPES)[number];
declare const UNKNOWN_WALLET_CLIENT_TYPES: readonly ["unknown"];
type UnknownWalletClientType = (typeof UNKNOWN_WALLET_CLIENT_TYPES)[number];
declare const SOLANA_WALLET_CLIENT_TYPES: readonly ["phantom", "solflare", "glow"];
type SolanaWalletClientType = (typeof SOLANA_WALLET_CLIENT_TYPES)[number];
type WalletClientType = InjectedWalletClientType | CoinbaseWalletClientType | WalletConnectWalletClientType | EmbeddedWalletClientType | UnknownWalletClientType | SolanaWalletClientType;

declare const SUPPORTED_CONNECTOR_TYPES: string[];
type ConnectorType = (typeof SUPPORTED_CONNECTOR_TYPES)[number];

interface ConnectedWalletMetadata {
    /** The wallet name (e.g. MetaMask). */
    name: string;
    /** The wallet RDNS, falls back to the wallet name if none is available. */
    id: string;
    /** The wallet logo */
    icon?: string;
}

interface BaseConnectedWallet {
    /** The wallet address. */
    address: string;
    /** The first time this wallet was connected without break. */
    connectedAt: number;
    /**
     * The wallet client where this key-pair is stored.
     * e.g. metamask, rainbow, coinbase_wallet, etc.
     */
    walletClientType: WalletClientType;
    /**
     * The connector used to initiate the connection with the wallet client.
     * e.g. injected, wallet_connect, coinbase_wallet, etc.
     */
    connectorType: ConnectorType;
    /** Whether the wallet is imported. */
    imported: boolean;
    /**
     * Metadata for the wallet.
     */
    meta: ConnectedWalletMetadata;
    /** Returns true if the wallet is connected, false otherwise */
    isConnected: () => Promise<boolean>;
    /**
     * @experimental **Experimental**: This property is {@link https://docs.privy.io/guide/guides/experimental-features subject to change at any time}.
     *
     * Not all wallet clients support programmatic disconnects (e.g. MetaMask, Phantom).
     * In kind, if the wallet"s client does not support programmatic disconnects,
     * this method will no-op.
     */
    disconnect: () => void;
}