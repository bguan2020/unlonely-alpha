import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { View, Image, StyleSheet, Platform, Text } from 'react-native';
import { useHaptics } from '../../utils/haptics';
import { SettingsSheet } from '../settings/settingsSheet';
import { MotiView } from 'moti';
import { AnimatedPressable } from '../buttons/animatedPressable';
import { AnimatedMenuView } from '../buttons/animatedMenuView';
import { useUserStore } from '../../utils/store/userStore';
import { useAppSettingsStore } from '../../utils/store/appSettingsStore';
import { useBottomSheetStore } from '../../utils/store/bottomSheetStore';
import { BlurLayer } from '../blur/blurLayer';

const AVATAR_SIZE = 48;

const sortingIconAnimationOptions: any = {
  animateInitialState: false,
  from: { opacity: 0, scale: 1.2 },
  animate: { opacity: 1, scale: 1 },
  transition: {
    scale: {
      type: 'spring',
      stiffness: 300,
      mass: 1,
    },
    opacity: {
      type: 'timing',
      duration: 100,
    },
  },
};

export function FeedNav() {
  const { _hasHydrated, connectedWallet, userData } = useUserStore(z => ({
    connectedWallet: z.connectedWallet,
    userData: z.userData,
    _hasHydrated: z._hasHydrated,
  }));
  const { nfcFeedSorting, setNFCFeedSorting } = useAppSettingsStore(z => ({
    nfcFeedSorting: z.nfcFeedSorting,
    setNFCFeedSorting: z.setNFCFeedSorting,
  }));
  const toggleSettingsSheet = useBottomSheetStore(z => z.toggleSettingsSheet);

  const isSortingByRecent = nfcFeedSorting === 'createdAt';
  const isSortingByLiked = nfcFeedSorting === 'score';

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
        pointerEvents="box-none" // prevents wrapper from blocking touch events on lower view
      >
        <AnimatedPressable onPress={toggleSettingsSheet}>
          <View
            style={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              borderRadius: 100,
              shadowColor: 'black',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.4,
              shadowRadius: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* TODO: change to X icon when bottom sheet is open? */}
            {_hasHydrated && connectedWallet && connectedWallet.ensAvatar ? (
              <View
                style={[
                  styles.floatingButton,
                  {
                    backgroundColor: 'rgba(0,0,0,0.15)',
                  },
                ]}
              >
                <BlurLayer
                  blurAmount={30}
                  blurType="dark"
                  style={{
                    position: 'absolute',
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    zIndex: 1,
                  }}
                ></BlurLayer>
                <Image
                  style={{
                    width: AVATAR_SIZE - 6,
                    height: AVATAR_SIZE - 6,
                    borderRadius: 100,
                    resizeMode: 'cover',
                    zIndex: 2,
                  }}
                  source={{
                    uri: userData
                      ? userData.isFCUser
                        ? userData.FCImageUrl
                        : connectedWallet.ensAvatar
                      : connectedWallet.ensAvatar,
                  }}
                />
              </View>
            ) : (
              <View style={styles.floatingButton}>
                <BlurLayer
                  blurAmount={30}
                  blurType="dark"
                  style={{
                    position: 'absolute',
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    zIndex: 1,
                  }}
                ></BlurLayer>
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

        {!connectedWallet && (
          <AnimatedPressable onPress={toggleSettingsSheet}>
            <View
              style={{
                width: 180,
                height: AVATAR_SIZE,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={styles.title}>connect wallet</Text>
            </View>
          </AnimatedPressable>
        )}

        <AnimatedMenuView
          onPressAction={({ nativeEvent }) => {
            useHaptics('light');
            setNFCFeedSorting(nativeEvent.event);
          }}
          title="sort NFCs by"
          actions={[
            {
              title: 'most recent',
              id: 'createdAt',
              state: isSortingByRecent ? 'on' : 'off',
              image: Platform.select({
                ios: 'sparkles',
                android: 'temp_preferences_custom',
              }),
            },
            {
              title: 'most liked',
              id: 'score',
              state: isSortingByLiked ? 'on' : 'off',
              image: Platform.select({
                ios: 'heart.fill',
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
              shadowOpacity: 0.4,
              shadowRadius: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View style={styles.floatingButton}>
              <BlurLayer
                blurAmount={30}
                blurType="dark"
                style={{
                  position: 'absolute',
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  zIndex: 1,
                }}
              ></BlurLayer>
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
  title: {
    fontSize: 16,
    fontFamily: 'NeuePixelSans',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#e2f979',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
});
