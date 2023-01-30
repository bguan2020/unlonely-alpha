import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { View, Platform, Image, StyleSheet } from 'react-native';
import { useHaptics } from '../../utils/haptics';
import { BlurLayer } from '../blur/blurLayer';
import { AnimatedMenuView } from '../buttons/animatedMenuView';
import { AnimatedPressable } from '../buttons/animatedPressable';

const AVATAR_SIZE = 32;

export function Presence({ data, reloadChat, reloadStream, openPresenceSheet }) {
  return (
    <>
      <View
        style={{
          position: 'relative',
          height: AVATAR_SIZE,
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: -AVATAR_SIZE,
          top: -AVATAR_SIZE / 2,
          zIndex: 3,
          paddingHorizontal: 8,
        }}
        pointerEvents="box-none"
      >
        <AnimatedMenuView
          onPressAction={({ nativeEvent }) => {
            useHaptics('light');

            if (nativeEvent.event === 'reload-chat') {
              reloadChat();
            }

            if (nativeEvent.event === 'reload-stream') {
              reloadStream();
            }
          }}
          actions={[
            {
              title: 'reload chat',
              id: 'reload-chat',
              image: Platform.select({
                ios: 'arrow.triangle.2.circlepath',
                android: 'temp_preferences_custom', // TODO: replace with a better icon
              }),
            },
            // {
            //   title: 'reload stream player',
            //   id: 'reload-stream',
            //   image: Platform.select({
            //     ios: 'arrow.triangle.2.circlepath',
            //     android: 'temp_preferences_custom',
            //   }),
            // },
          ]}
        >
          <View
            style={{
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 6,
              },
              shadowOpacity: 0.5,
              shadowRadius: 7,
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
              <MaterialCommunityIcons
                name="dots-horizontal"
                size={AVATAR_SIZE - 6}
                color="rgba(255,255,255,1)"
                style={{
                  zIndex: 2,
                }}
              />
            </View>
          </View>
        </AnimatedMenuView>
        <View>
          <AnimatedPressable onPress={openPresenceSheet}>
            <View
              style={{
                flexDirection: 'row',
              }}
            >
              {data.map(d => {
                const user = d.data.user;

                return (
                  <MotiView
                    from={{
                      opacity: 0,
                      scale: 0.85,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      type: 'timing',
                      duration: 150,
                      delay: 250,
                    }}
                    key={d.clientId}
                    style={{
                      width: AVATAR_SIZE - 4,
                      height: AVATAR_SIZE - 4,
                      borderRadius: 100,
                      backgroundColor: '#222',
                      marginLeft: -8,
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 6,
                      },
                      shadowOpacity: 0.5,
                      shadowRadius: 7,
                      alignItems: 'center',
                      justifyContent: 'center',
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
                  </MotiView>
                );
              })}
            </View>
          </AnimatedPressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 100,
    overflow: 'hidden',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
  },
});
