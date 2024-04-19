import { fetchQuery, init } from "@airstack/node";

const GET_SOCIAL = `
  query GetSocial($identity: Identity!, $blockchain: TokenBlockchain!) {
    Wallet(input: { identity: $identity, blockchain: $blockchain }) {
      addresses
      primaryDomain {
        name
      }
      domains {
        isPrimary
        name
        tokenNft {
          tokenId
          address
          blockchain
        }
        lastUpdatedBlockTimestamp
        createdAtBlockNumber
        createdAtBlockTimestamp
      }
      farcasterSocials: socials(
        input: { filter: { dappName: { _eq: farcaster } } }
      ) {
        isDefault
        blockchain
        profileName
        profileHandle
        profileImage
        followerCount
        followingCount
        profileTokenId
        profileTokenAddress
        profileImageContentValue {
          image {
            small
          }
        }
      }
      lensSocials: socials(input: { filter: { dappName: { _eq: lens } } }) {
        isDefault
        blockchain
        profileName
        profileHandle
        profileImage
        followerCount
        followingCount
        profileTokenId
        profileTokenAddress
        profileImageContentValue {
          image {
            small
          }
        }
      }
      xmtp {
        isXMTPEnabled
      }
    }
  }
`;

export type SocialData = {
  username?: string;
  FCImageUrl?: string;
  isFCUser?: boolean;
  lensHandle?: string;
  lensImageUrl?: string;
  isLensUser?: boolean;
};

export const fetchSocial = async (
  identity: string,
  blockchain: string
): Promise<SocialData> => {
  try {
    if (!process.env.AIRSTACK_API_KEY) {
      throw new Error("AIRSTACK_API_KEY not set");
    }
    init(String(process.env.AIRSTACK_API_KEY));
    const { data: res, error } = await fetchQuery(GET_SOCIAL, {
      identity,
      blockchain,
    });
    if (error) {
      console.log("airstack query error", identity, error);
      return {};
    }
    const ens =
      res?.Wallet?.primaryDomain?.name ?? res?.Wallet?.domains?.[0]?.name;
    const fc = res?.Wallet?.farcasterSocials?.[0];
    const lens = res?.Wallet?.lensSocials?.[0];
    const newData: SocialData = {};
    if (ens !== null && ens !== undefined) {
      newData.username = ens;
    }
    if (fc !== null && fc !== undefined) {
      newData.isFCUser = true;
    } else {
      newData.isFCUser = false;
    }
    if (
      fc?.profileImageContentValue?.image?.small !== null &&
      fc?.profileImageContentValue?.image?.small !== undefined
    ) {
      newData.FCImageUrl = fc.profileImageContentValue.image.small;
    } else {
      newData.FCImageUrl = "";
    }
    if (lens !== null && lens !== undefined) {
      newData.isLensUser = true;
    } else {
      newData.isLensUser = false;
    }
    if (lens?.profileHandle !== null && lens?.profileHandle !== undefined) {
      newData.lensHandle = lens.profileHandle;
    } else {
      newData.lensHandle = "";
    }
    if (
      lens?.profileImageContentValue?.image?.small !== null &&
      lens?.profileImageContentValue?.image?.small !== undefined
    ) {
      newData.lensImageUrl = lens.profileImageContentValue.image.small;
    } else {
      newData.lensImageUrl = "";
    }
    return newData;
  } catch (e) {
    console.log("fetchSocial error", identity, e);
    return {};
  }
};
