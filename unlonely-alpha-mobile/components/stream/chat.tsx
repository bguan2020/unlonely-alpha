import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { easeGradient } from 'react-native-easing-gradient';
import { WebView } from 'react-native-webview';
import { useUserStore } from '../../utils/store/userStore';
import { AnimatedPressable } from '../buttons/animatedPressable';
import { useRouter } from 'expo-router';
import { useBottomSheetStore } from '../../utils/store/bottomSheetStore';
import { UnlonelyTopGradient } from '../nav/topGradient';
import { Presence } from './presence';
import BottomSheet from '@gorhom/bottom-sheet';
import { ScrollView } from 'react-native-gesture-handler';
import { truncate0x, truncateEns } from '../../utils/truncate';
import { Ionicons } from '@expo/vector-icons';

const AVATAR_SIZE = 48;
const CHAT_WEBVIEW_URL = 'https://www.unlonely.app/mobile/chat';
// const CHAT_WEBVIEW_URL = 'http://192.168.1.69:3000/mobile/chat';

const funnyName = [
  'ted’s mom',
  'borodutch in VR',
  'blob',
  'dan romero on his iPad',
  'ivy’s clubhouse nemesis',
  'one of the fake vitaliks',
  'narc andreessen',
  '200 people from brian’s family group chat',
  'someone from lens',
  'worldcoin eye scanning orb',
  'murder dog',
  'one of brian’s 300 tinder dates',
  'kevin trying to hack into the mainframe',
];

export function Chat() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [chatKey, setChatKey] = useState(0);
  const { userData, connectedWallet } = useUserStore(z => ({
    userData: z.userData,
    connectedWallet: z.connectedWallet,
  }));
  const { openSettingsSheet, openCKSheet } = useBottomSheetStore(z => ({
    openSettingsSheet: z.openSettingsSheet,
    openCKSheet: z.openCKSheet,
  }));
  const [chatEnabled, setChatEnabled] = useState(false);
  const [finishedLoading, setFinishedLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const catchWebViewNavigationStateChange = (newNavState: any) => {
    const { url } = newNavState;

    if (url !== CHAT_WEBVIEW_URL) {
      webViewRef.current.stopLoading();
      webViewRef.current.reload();
    }
  };

  const reloadChat = () => {
    setChatKey(chatKey + 1);
    setChatEnabled(true);
  };

  const reloadStream = () => {};

  const handleConnection = () => {
    if (userData?.address || connectedWallet?.address) {
      reloadChat();
    } else {
      setChatEnabled(true);
      router.push('/');
      openSettingsSheet();
      setTimeout(() => {
        openCKSheet();
      }, 1000);
    }
  };

  useEffect(() => {
    if (userData?.address || connectedWallet?.address) {
      // reload webview if userData changes so it has correct headers
      // happens when user goes to chat tab first then connects wallet
      reloadChat();
    } else {
      setChatEnabled(false);
    }
  }, [userData, connectedWallet]);

  const handlePresence = async (event: any) => {
    const { data } = event.nativeEvent;

    if (data === 'chat_loaded') {
      setFinishedLoading(true);
      return;
    }

    const parsedData = JSON.parse(data);

    if (parsedData.length === onlineUsers.length) return;
    setOnlineUsers(parsedData);
  };

  return (
    <>
      <Presence
        data={onlineUsers}
        reloadChat={reloadChat}
        reloadStream={reloadStream}
        openPresenceSheet={() => bottomSheetRef.current?.expand()}
      />
      <View
        // chat container
        style={{
          flex: 1,
          backgroundColor: 'black',
        }}
      >
        <UnlonelyTopGradient />
        <LinearGradient
          colors={colors}
          locations={locations}
          start={[0, 1]}
          end={[0, 0]}
          style={{
            width: '100%',
            height: 80,
            position: 'absolute',
            bottom: -5,
          }}
          pointerEvents="none"
        />
        {!finishedLoading && (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              width: '100%',
              height: '100%',
            }}
          >
            <ActivityIndicator size="large" color="black" />
            <Text style={styles.loadingText}>loading chat...</Text>
          </View>
        )}

        <WebView
          key={chatKey}
          ref={webViewRef}
          source={{ uri: CHAT_WEBVIEW_URL }}
          onNavigationStateChange={catchWebViewNavigationStateChange}
          onContentProcessDidTerminate={webViewRef.current?.reload}
          // reload chat if it crashes?
          // maybe app entitlements needs to request more memory?
          style={{
            // paddingBottom: 100,
            backgroundColor: 'transparent',
          }}
          contentMode="mobile"
          overScrollMode="never"
          scalesPageToFit={false}
          setBuiltInZoomControls={false}
          setDisplayZoomControls={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onLoadStart={() => {
            setFinishedLoading(false);
          }}
          // scrollEnabled={false}
          // @ts-ignore
          zoomScale={1}
          onMessage={handlePresence}
        />
        {!chatEnabled && (
          <MotiView style={styles.overlay}>
            <View
              style={{
                width: '100%',
                height: 80,
                position: 'absolute',
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.25)',
              }}
            ></View>
            <LinearGradient
              colors={colors}
              locations={locations}
              start={[0, 1]}
              end={[0, 0]}
              style={{
                width: '100%',
                height: 220,
                position: 'absolute',
                bottom: 0,
              }}
              pointerEvents="none"
            />

            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={styles.overlayText}>connect your wallet to chat</Text>

              <AnimatedPressable onPress={handleConnection} style={styles.button}>
                <Text style={styles.buttonText}>connect</Text>
              </AnimatedPressable>
            </View>
          </MotiView>
        )}
      </View>
      <BottomSheet ref={bottomSheetRef} snapPoints={['55%']} {...bottomSheetOptions}>
        <View>
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'NeuePixelSans',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              color: '#e2f979',
              textAlign: 'center',
              paddingHorizontal: 32,
              paddingBottom: 4,
            }}
          >
            who’s here?
          </Text>
        </View>
        <View
          style={{
            position: 'absolute',
            right: 4,
            top: -12,
            zIndex: 9,
          }}
        >
          <AnimatedPressable
            style={{
              width: 44,
              height: 44,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => bottomSheetRef.current?.close()}
          >
            <Ionicons name="close-circle" size={24} color="#333" />
          </AnimatedPressable>
        </View>
        <ScrollView style={styles.bottomSheetBackground}>
          <View
            style={{
              paddingBottom: 32,
            }}
          >
            {onlineUsers?.map((d, index) => {
              const user = d.data.user;

              return (
                <View style={styles.presenceRow} key={d.clientId}>
                  <View
                    style={{
                      width: AVATAR_SIZE - 4,
                      height: AVATAR_SIZE - 4,
                      borderRadius: 100,
                      backgroundColor: '#222',
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 6,
                      },
                      shadowOpacity: 0.5,
                      shadowRadius: 7,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                    }}
                  >
                    {user ? (
                      <>
                        {user?.isFCUser && (
                          <Image
                            source={{
                              uri: user?.FCImageUrl,
                            }}
                            style={{
                              width: AVATAR_SIZE - 4,
                              height: AVATAR_SIZE - 4,
                              borderRadius: 100,
                            }}
                          ></Image>
                        )}
                        {!user?.isFCUser && (
                          <Ionicons
                            name="ios-person"
                            size={AVATAR_SIZE / 2.4}
                            color="#e6f88a"
                            style={{
                              top: -1,
                              zIndex: 2,
                            }}
                          />
                        )}
                      </>
                    ) : (
                      <Ionicons
                        name="ios-person"
                        size={AVATAR_SIZE / 2.4}
                        color="#666"
                        style={{
                          top: -1,
                          zIndex: 2,
                        }}
                      />
                    )}
                  </View>
                  {user?.nfcRank === 3 && (
                    <Image
                      source={{
                        uri: 'https://www.unlonely.app/images/badges/nfc_rank_1.png',
                      }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 5,
                        marginRight: 8,
                      }}
                    />
                  )}
                  <View>
                    <Text style={styles.presenceUsername}>{user?.username || 'mysterious anon 👀'}</Text>
                    <Text style={styles.presenceAddress}>
                      {user?.address ? truncate0x(user?.address) : `maybe: ${funnyName[index % funnyName.length]}`}
                    </Text>
                    <View
                      // badges
                      style={{
                        paddingTop: 4,
                        flexDirection: 'row',
                      }}
                    >
                      {user?.powerUserLvl === 1 && (
                        <Image
                          source={{
                            uri: 'https://www.unlonely.app/images/badges/lvl1_poweruser.png',
                          }}
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 5,
                            marginRight: 4,
                          }}
                        />
                      )}

                      {user?.powerUserLvl === 2 && (
                        <Image
                          source={{
                            uri: 'https://www.unlonely.app/images/badges/lvl2_poweruser.png',
                          }}
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 5,
                            marginRight: 4,
                          }}
                        />
                      )}

                      {user?.powerUserLvl === 3 && (
                        <Image
                          source={{
                            uri: 'https://www.unlonely.app/images/badges/lvl3_poweruser.png',
                          }}
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 5,
                            marginRight: 4,
                          }}
                        />
                      )}

                      {user?.videoSavantLvl === 1 && (
                        <Image
                          source={{
                            uri: 'https://www.unlonely.app/images/badges/lvl1_host.png',
                          }}
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 5,
                            marginRight: 4,
                          }}
                        />
                      )}

                      {user?.videoSavantLvl === 2 && (
                        <Image
                          source={{
                            uri: 'https://www.unlonely.app/images/badges/lvl2_host.png',
                          }}
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 5,
                            marginRight: 4,
                          }}
                        />
                      )}

                      {user?.videoSavantLvl === 3 && (
                        <Image
                          source={{
                            uri: 'https://www.unlonely.app/images/badges/lvl3_host.png',
                          }}
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 5,
                            marginRight: 4,
                          }}
                        />
                      )}

                      {user?.isFCUser && (
                        <Image
                          source={{
                            uri: 'https://www.unlonely.app/images/farcaster_logo.png',
                          }}
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 5,
                            marginRight: 4,
                            backgroundColor: 'white',
                          }}
                        />
                      )}

                      {user?.isLensUser && (
                        <Image
                          source={{
                            uri: 'https://www.unlonely.app/images/lens_logo.png',
                          }}
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 5,
                            marginRight: 4,
                            backgroundColor: 'white',
                          }}
                        />
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </BottomSheet>
    </>
  );
}

const bottomSheetOptions = {
  index: -1,
  enablePanDownToClose: true,
  bottomInset: 90,
  backgroundStyle: {
    backgroundColor: '#111',
  },
  handleStyle: {
    backgroundColor: 'transparent',
  },
  handleIndicatorStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  style: {
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    zIndex: 8,
  },
};

const { colors, locations } = easeGradient({
  // Eased gradient function so it doesn’t look like garbage
  colorStops: {
    0: {
      color: 'rgba(0,0,0,1)',
    },
    1: {
      color: 'rgba(0,0,0,0)',
    },
  },
});

const styles = StyleSheet.create({
  overlay: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  overlayText: {
    fontSize: 16,
    fontFamily: 'NeuePixelSans',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#e2f979',
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  button: {
    backgroundColor: '#be47d1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 8,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontFamily: 'NeuePixelSans',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'NeuePixelSans',
    letterSpacing: 0.5,
    color: 'black',
  },
  bottomSheetBackground: {
    backgroundColor: '#111',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  presenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: 'hsl(0, 0%, 12%)',
    borderBottomWidth: 1,
  },
  presenceUsername: {
    color: 'white',
    fontFamily: 'NeuePixelSans',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  presenceAddress: {
    color: '#999',
    fontFamily: 'NeuePixelSans',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
