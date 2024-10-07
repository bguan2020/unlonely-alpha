import { fetchQuery, init } from "@airstack/node";

const walletField = `
addresses
primaryDomain {
  name
}
domains {
  isPrimary
  name
  lastUpdatedBlockTimestamp
  createdAtBlockNumber
  createdAtBlockTimestamp
}
farcasterSocials: socials(input: {filter: {dappName: {_eq: farcaster}}}) {
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
`;

const GET_SOCIAL = `
  query GetSocial($identity: Identity!) {
    Wallet(input: { identity: $identity }) {
      ${walletField}
    }
  }
`;

export type SocialData = {
  username?: string;
  FCHandle?: string;
  FCImageUrl?: string;
  isFCUser?: boolean;
  lensHandle?: string;
  lensImageUrl?: string;
  isLensUser?: boolean;
};

export const fetchSocial = async (
  identity: string
): Promise<{ socialData: SocialData, rawData: any, error: string }> => {
  try {
    if (!process.env.AIRSTACK_API_KEY) {
      throw new Error("AIRSTACK_API_KEY not set");
    }
    init(String(process.env.AIRSTACK_API_KEY));
    const { data: res, error } = await fetchQuery(GET_SOCIAL, {
      identity,
    });
    console.log("fetchSocial", identity, res, error);
    if (error) {
      console.log("airstack query error", identity, error);
      return { socialData: {}, rawData: {}, error: error.message };
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
    if (fc?.profileHandle !== null && fc?.profileHandle !== undefined) {
      newData.FCHandle = fc.profileHandle;
    } else {
      newData.FCHandle = "";
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
    return {socialData: newData, rawData: res, error: ""};
  } catch (e: any) {
    console.log("fetchSocial error", identity, e);
    return { socialData: {}, rawData: {}, error: String(e.message) };
  }
};

export const fetchMultipleSocials = async (
  identities: string[],
  blockchains: string[]
) => {
  try {
    if (!process.env.AIRSTACK_API_KEY) {
      throw new Error("AIRSTACK_API_KEY not set");
    }
    if (identities.length !== blockchains.length) {
      throw new Error("identities and blockchains length mismatch");
    }
    init(String(process.env.AIRSTACK_API_KEY));

    let batchInput = "";
    let batchFields = "";
    identities.forEach((_, index) => {
      batchInput += `$identity${index}: Identity!, $blockchain${index}: TokenBlockchain!${
        index === identities.length - 1 ? "" : ", "
      }`;
      batchFields += `
        wallet${index}: Wallet(input: { identity: $identity${index}, blockchain: $blockchain${index} }) {
          ${walletField}
        }`;
    });

    const batchQuery = `
      query GetSocialBatch(${batchInput}) {
        ${batchFields}
      }
    `;

    const variables = {
      ...identities.reduce(
        (acc: { [key: string]: string }, identity, index) => {
          acc[`identity${index}`] = identity;
          return acc;
        },
        {}
      ),
      ...blockchains.reduce(
        (acc: { [key: string]: string }, blockchain, index) => {
          acc[`blockchain${index}`] = blockchain;
          return acc;
        },
        {}
      ),
    };

    const { data: res, error } = await fetchQuery(batchQuery, variables);

    if (error) {
      console.log("airstack query error", error);
      return {};
    }

    const newData: { [key: string]: SocialData } = {};
    identities.forEach((identity, index) => {
      console.log("res", res, variables);
      const indexedData = res[`wallet${index}`];
      const ens =
        indexedData?.primaryDomain?.name ?? indexedData?.domains?.[0]?.name;
      const fc = indexedData?.farcasterSocials?.[0];
      const lens = indexedData?.lensSocials?.[0];
      newData[identity] = {};
      if (ens !== null && ens !== undefined) {
        newData[identity].username = ens;
      }
      if (fc !== null && fc !== undefined) {
        newData[identity].isFCUser = true;
      } else {
        newData[identity].isFCUser = false;
      }
      if (
        fc?.profileImageContentValue?.image?.small !== null &&
        fc?.profileImageContentValue?.image?.small !== undefined
      ) {
        newData[identity].FCImageUrl = fc.profileImageContentValue.image.small;
      } else {
        newData[identity].FCImageUrl = "";
      }
      if (fc?.profileHandle !== null && fc?.profileHandle !== undefined) {
        newData[identity].FCHandle = fc.profileHandle;
      } else {
        newData[identity].FCHandle = "";
      }
      if (lens !== null && lens !== undefined) {
        newData[identity].isLensUser = true;
      } else {
        newData[identity].isLensUser = false;
      }
      if (lens?.profileHandle !== null && lens?.profileHandle !== undefined) {
        newData[identity].lensHandle = lens.profileHandle;
      } else {
        newData[identity].lensHandle = "";
      }
      if (
        lens?.profileImageContentValue?.image?.small !== null &&
        lens?.profileImageContentValue?.image?.small !== undefined
      ) {
        newData[identity].lensImageUrl =
          lens.profileImageContentValue.image.small;
      } else {
        newData[identity].lensImageUrl = "";
      }
    });
    return newData;
  } catch (e) {
    console.log("fetchMultipleSocials error", e);
    return {};
  }
};
