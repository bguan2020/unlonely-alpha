import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { View, Image, StyleSheet, Platform } from 'react-native';
import { useHaptics } from '../../utils/haptics';
import { useAppSettingsStore, useConnectedWalletStore } from '../../utils/store';
import { SettingsSheet } from '../settings/settingsSheet';
import { MotiView } from 'moti';
import { AnimatedPressable } from '../buttons/animatedPressable';
import { AnimatedMenuView } from '../buttons/animatedMenuView';

const AVATAR_SIZE = 40;

const sortingIconAnimationOptions: any = {
  animateInitialState: false,
  from: { opacity: 0, scale: 1.25 },
  animate: { opacity: 1, scale: 1 },
  transition: {
    scale: {
      type: 'spring',
      stiffness: 300,
      mass: 1,
    },
    opacity: {
      type: 'timing',
      duration: 160,
    },
  },
};

export function FeedNav() {
  const connectedWallet = useConnectedWalletStore(z => z.connectedWallet);
  const { nfcFeedSort, setNFCFeedSorting, toggleSettingsSheet } = useAppSettingsStore(z => ({
    nfcFeedSort: z.nfcFeedSorting,
    setNFCFeedSorting: z.setNFCFeedSorting,
    toggleSettingsSheet: z.toggleSettingsSheet,
  }));
  const isSortingByRecent = nfcFeedSort === 'recent';
  const isSortingByLiked = nfcFeedSort === 'liked';

  return (
    <>
      <View
        style={{
          position: 'absolute',
          width: '100%',
          height: AVATAR_SIZE + 8,
          top: 70, // get height of top bar
          left: 0,
          zIndex: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 12,
        }}
      >
        <AnimatedPressable onPress={toggleSettingsSheet}>
          <View
            style={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              borderRadius: 100,
              shadowColor: 'black',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.5,
              shadowRadius: 15,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {connectedWallet ? (
              <Image
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  borderRadius: 100,
                  resizeMode: 'cover',
                }}
                source={{
                  uri: 'https://wojtek.im/face.jpg',
                }}
              />
            ) : (
              <View style={styles.floatingButton}>
                <BlurView
                  intensity={80}
                  tint="dark"
                  style={{
                    position: 'absolute',
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    zIndex: 1,
                  }}
                ></BlurView>
                <Ionicons
                  name="ios-person"
                  size={20}
                  color="#e6f88a"
                  style={{
                    top: -1,
                    zIndex: 2,
                  }}
                />
              </View>
            )}
          </View>
        </AnimatedPressable>

        <AnimatedMenuView
          onPressAction={({ nativeEvent }) => {
            useHaptics('light');

            if (nativeEvent.event === 'liked') {
              setNFCFeedSorting('liked');
            }

            if (nativeEvent.event === 'recent') {
              setNFCFeedSorting('recent');
            }
          }}
          title="sorting"
          actions={[
            {
              title: 'most recent',
              id: 'recent',
              state: isSortingByRecent ? 'on' : 'off',
              image: Platform.select({
                ios: 'sparkles',
                android: 'temp_preferences_custom',
              }),
            },
            {
              title: 'most liked',
              id: 'liked',
              state: isSortingByLiked ? 'on' : 'off',
              image: Platform.select({
                ios: 'heart',
                android: 'favorite',
              }),
            },
          ]}
        >
          <View
            style={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              borderRadius: 100,
              shadowColor: 'black',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.5,
              shadowRadius: 15,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View style={styles.floatingButton}>
              <BlurView
                intensity={80}
                tint="dark"
                style={{
                  position: 'absolute',
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  zIndex: 1,
                }}
              ></BlurView>
              <View
                style={{
                  height: AVATAR_SIZE,
                  width: AVATAR_SIZE,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  zIndex: 2,
                }}
              >
                {isSortingByRecent ? (
                  <MotiView {...sortingIconAnimationOptions} key="recent">
                    <FontAwesome name="sort-alpha-asc" size={20} color="#e6f88a" />
                  </MotiView>
                ) : (
                  <MotiView {...sortingIconAnimationOptions} key="liked">
                    <FontAwesome name="sort-numeric-desc" size={20} color="#e6f88a" />
                  </MotiView>
                )}
              </View>
            </View>
          </View>
        </AnimatedMenuView>
      </View>
      <SettingsSheet />
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 100,
    overflow: 'hidden',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
  },
});
