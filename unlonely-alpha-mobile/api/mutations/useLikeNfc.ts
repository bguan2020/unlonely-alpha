import { useMutation } from '@tanstack/react-query';
import { useUserStore } from '../../utils/store/userStore';
import { useGqlClient } from '../client';
import { DISLIKE_NFC_MUTATION, LIKE_NFC_MUTATION } from '../graphql/nfc';

type LikeNfcTypes = {
  likableId: string;
};

export function useLikeNfc({ likableId }: LikeNfcTypes) {
  const gqlClient = useGqlClient();
  const { userData } = useUserStore(z => ({
    userData: z.userData,
  }));

  const powerValues = {
    0: 1,
    1: 2,
    2: 4,
    3: 6,
  };

  const powerLvl = userData?.powerUserLvl || 0;
  const likeAmount = powerValues[powerLvl];
  const likeValue = Number(likeAmount) / 2;

  const like = useMutation(['like'], () => {
    console.log('👍 ----- liking nfc -----');
    return gqlClient.request(LIKE_NFC_MUTATION, {
      // value is half becuase some weird shit is happening with double mutations idk, really weird
      data: { likedObj: 'NFC', likableId: likableId, value: likeValue < 1 ? 1 : likeValue },
    });
  });

  return like;
}

export function useDislikeNfc({ likableId }: LikeNfcTypes) {
  const gqlClient = useGqlClient();
  const { userData } = useUserStore(z => ({
    userData: z.userData,
  }));

  const powerValues = {
    0: 1,
    1: 2,
    2: 4,
    3: 6,
  };

  const powerLvl = userData?.powerUserLvl || 0;
  const likeAmount = powerValues[powerLvl];
  const dislikeValue = Number(-likeAmount) / 2;

  const dislike = useMutation(['dislike'], () => {
    console.log('👎 ----- disliking nfc -----');
    return gqlClient.request(DISLIKE_NFC_MUTATION, {
      // value is half becuase some weird shit is happening with double mutations idk, really weird
      data: { likedObj: 'NFC', likableId: likableId, value: dislikeValue < 1 ? 1 : dislikeValue },
    });
  });

  return dislike;
}
