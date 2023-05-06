import { View, Text, StyleSheet, ActivityIndicator, TouchableHighlight, TouchableOpacity } from 'react-native';
import { AnimatedPressable } from '../buttons/animatedPressable';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useUserStore } from '../../utils/store/userStore';
import { toast } from '../toast/toast';
import { useHaptics } from '../../utils/haptics';
import { useDislikeNfc, useLikeNfc } from '../../api/mutations/useLikeNfc';

export function LikeCounter({ score, liked, nfcId }) {
  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(liked);
  const [calculatedScore, setCalculatedScore] = useState(score);
  const { connectedWallet } = useUserStore(z => ({ connectedWallet: z.connectedWallet }));
  const likeNfc = useLikeNfc({ likableId: nfcId });
  const dislikeNfc = useDislikeNfc({ likableId: nfcId });

  const toggleLike = () => {
    if (isLiked) {
      console.log('mutating dislike');
      dislikeNfc.mutate();
    } else {
      console.log('mutating like');
      likeNfc.mutate();
    }

    setLoading(true);
    setIsLiked(!isLiked);
  };

  // useEffect(() => {
  //   setIsLiked(liked);
  //   setCalculatedScore(score);
  // }, [liked, score]);

  useEffect(() => {
    if (likeNfc?.data?.handleLike) {
      console.log('calculating 👋 like...', likeNfc?.data?.handleLike?.score);
      setCalculatedScore(likeNfc?.data?.handleLike?.score);
      setLoading(false);
    }
  }, [likeNfc?.data?.handleLike]);

  useEffect(() => {
    if (dislikeNfc?.data?.handleLike) {
      console.log('calculating 😡 dislike...', dislikeNfc?.data?.handleLike?.score);
      setCalculatedScore(dislikeNfc?.data?.handleLike?.score);
      setLoading(false);
    }
  }, [dislikeNfc?.data?.handleLike]);

  const authToLike = () => {
    toast('connect wallet to like', 'error');
    useHaptics('medium');
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {loading ? (
        <ActivityIndicator color="white" size={'small'} />
      ) : (
        <Text key={nfcId} style={styles.likedCount}>
          {calculatedScore}
        </Text>
      )}
      <AnimatedPressable
        style={{
          width: 48,
          height: 48,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={toggleLike}
        bouncy
        disabled={!connectedWallet}
      >
        {isLiked ? (
          <Ionicons name="md-heart" size={32} color="rgba(255, 43, 43, 1)" />
        ) : (
          <Ionicons name="md-heart-outline" size={32} color="rgba(255,255,255,0.75)" />
        )}
      </AnimatedPressable>
      {!connectedWallet && (
        <AnimatedPressable
          onPress={authToLike}
          style={{
            width: 100,
            height: 64,
            position: 'absolute',
            right: -8,
            top: -32,
          }}
        ></AnimatedPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  likedCount: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.75)',
    paddingVertical: 16,
    fontFamily: 'NeuePixelSans',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
    elevation: 5,
  },
});
