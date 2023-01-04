import { FontAwesome, Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { MenuView } from '@react-native-menu/menu';
import { BlurView } from 'expo-blur';
import { useCallback, useMemo, useRef } from 'react';
import { View, Image, Pressable, useWindowDimensions, StyleSheet, Platform } from 'react-native';

const AVATAR_SIZE = 40;

export function FeedNav() {
  const { height } = useWindowDimensions();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [height - 130], [height]);
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

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
        {/* settings */}
        <Pressable
          onPress={() => {
            console.log('pressing settings button');
            bottomSheetRef.current?.expand();
          }}
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
            {/* <Image
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: 100,
                resizeMode: 'cover',
              }}
              source={{
                uri: 'https://wojtek.im/face.jpg',
              }}
            /> */}
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
          </View>
        </Pressable>
        <View>
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
              <MenuView
                onPressAction={({ nativeEvent }) => {
                  console.log('action', nativeEvent.event);
                }}
                title="sorting"
                actions={[
                  {
                    title: 'most recent',
                    id: 'recent',
                    subtitle: 'sort by most recent',
                    state: 'on', // hook into zustand
                    image: Platform.select({
                      ios: 'sparkles',
                      android: 'temp_preferences_custom',
                    }),
                  },
                  {
                    title: 'most liked',
                    id: 'liked',
                    subtitle: 'sort by most liked',
                    state: 'off', // hook into zustand
                    image: Platform.select({
                      ios: 'heart',
                      android: 'favorite',
                    }),
                  },
                ]}
                style={{
                  height: AVATAR_SIZE,
                  width: AVATAR_SIZE,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  zIndex: 2,
                }}
              >
                {/* show different icon based on zustand value */}
                <FontAwesome name="sort-alpha-asc" size={20} color="#e6f88a" />
                {/* <FontAwesome name="sort-numeric-desc" size={20} color="#e6f88a" /> */}
              </MenuView>
            </View>
          </View>
        </View>
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
        onChange={handleSheetChanges}
        enablePanDownToClose
      >
        <View
          style={{
            backgroundColor: 'red',
            flex: 1,
          }}
        ></View>
      </BottomSheet>
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
