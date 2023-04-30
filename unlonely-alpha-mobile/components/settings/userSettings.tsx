import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useEffect } from 'react';
import { Text, StyleSheet, View, Image, ActivityIndicator } from 'react-native';
import { useUser } from '../../api/queries/useUser';
import { fadeInScale } from '../../utils/animations';
import { useBottomSheetStore } from '../../utils/store/bottomSheetStore';
import { useUserStore } from '../../utils/store/userStore';
import { truncate0x, truncateEns } from '../../utils/truncate';
import { AnimatedPressable } from '../buttons/animatedPressable';

const AVATAR_SIZE = 48;

export const UserSettings = () => {
  const { isSettingsSheetOpen, openCoinbaseSheet, openCKSheet } = useBottomSheetStore(z => ({
    isSettingsSheetOpen: z.isSettingsSheetOpen,
    openCoinbaseSheet: z.openCoinbaseSheet,
    openCKSheet: z.openCKSheet,
  }));
  const { hasHydrated, connectedWallet, userData, setUser, userDataLoading, setUserDataLoading } = useUserStore(z => ({
    hasHydrated: z._hasHydrated,
    userDataLoading: z.userDataLoading,
    setUserDataLoading: z.setUserDataLoading,
    connectedWallet: z.connectedWallet,
    userData: z.userData,
    setUser: z.setUser,
  }));
  const hydratedWalletAddress = hasHydrated && connectedWallet ? connectedWallet.address : 'user';
  const { data: apiUser, run: getUserData } = useUser(hydratedWalletAddress, { address: hydratedWalletAddress });

  useEffect(() => {
    // runs pretty much on every open of the settings bottom sheet
    // and whenever userData changes
    if (userData && !isSettingsSheetOpen) {
      // refreshes user data from the database
      console.log('[settings] refreshing user data...');
      getUserData();
    }

    if (userData?.address && userDataLoading) {
      setUserDataLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    // runs after getUserData() is called
    if (apiUser) {
      setUserDataLoading(false);
      setUser(apiUser.getUser);
    }
  }, [apiUser]);

  return (
    <>
      <Text style={styles.title}>Connected as</Text>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 8,
        }}
      >
        {hasHydrated ? (
          <View style={styles.userRow}>
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
                marginLeft: -4,
              }}
            >
              {connectedWallet && connectedWallet.ensAvatar ? (
                <MotiView
                  {...fadeInScale}
                  style={[
                    styles.floatingButton,
                    {
                      backgroundColor: 'rgba(0,0,0,0.15)',
                    },
                  ]}
                >
                  <Image
                    style={{
                      width: AVATAR_SIZE - 6,
                      height: AVATAR_SIZE - 6,
                      borderRadius: 100,
                      resizeMode: 'cover',
                    }}
                    source={{
                      uri: userData
                        ? userData.isFCUser
                          ? userData.FCImageUrl
                          : connectedWallet.ensAvatar
                        : connectedWallet.ensAvatar,
                    }}
                  />
                </MotiView>
              ) : (
                <MotiView style={styles.floatingButton} {...fadeInScale}>
                  {userDataLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Ionicons
                      name="ios-person"
                      size={20}
                      color="#e2f979"
                      style={{
                        top: -1,
                        zIndex: 2,
                      }}
                    />
                  )}
                </MotiView>
              )}
            </View>
            <View
              style={{
                paddingLeft: 12,
              }}
            >
              {connectedWallet ? (
                connectedWallet.ensName && <Text style={styles.ensText}>{truncateEns(connectedWallet.ensName)}</Text>
              ) : (
                <Text style={styles.ensText}>lonely anon</Text>
              )}

              {connectedWallet && <Text style={styles.addressText}>{truncate0x(connectedWallet.address)}</Text>}
            </View>
          </View>
        ) : (
          <View style={styles.userRow}>
            <Text style={styles.ensText}>hydrating...</Text>
          </View>
        )}
        {!userDataLoading && (
          <MotiView {...fadeInScale}>
            <AnimatedPressable style={styles.manageButton} onPress={connectedWallet ? openCKSheet : openCoinbaseSheet}>
              <Text style={styles.manageButtonText}>{connectedWallet ? 'disconnect' : 'connect wallet'}</Text>
            </AnimatedPressable>
          </MotiView>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontFamily: 'NeuePixelSans',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#e2f979',
    textAlign: 'left',
    marginTop: 16,
  },
  subtitle: {
    color: 'white',
    fontFamily: 'NeuePixelSans',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  ensText: {
    color: 'white',
    fontFamily: 'NeuePixelSans',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  addressText: {
    color: '#666',
    fontFamily: 'NeuePixelSans',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  manageButton: {
    backgroundColor: '#be47d1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  manageButtonText: {
    textAlign: 'center',
    color: 'white',
    fontFamily: 'NeuePixelSans',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
