import { useCallback, useEffect } from 'react';
import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Platform, View, StyleSheet, AppState } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { easeGradient } from 'react-native-easing-gradient';
import { useFonts } from 'expo-font';
import { QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { queryClient } from '../../api/client';
import NetInfo from '@react-native-community/netinfo';
import { useAppState } from '../../utils/useAppState';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
  // Load up the fonts as early as possible
  const [fontsLoaded] = useFonts({
    NeuePixelSans: require('../../assets/fonts/NeuePixelSans.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      // do some splash screen animation here
      console.log('======== FONTS LOADED ==================================');
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Some networking shit for reconnecting to the internet
    // coming from react-query
    useAppState();

    if (Platform.OS !== 'web') {
      return NetInfo.addEventListener(state => {
        onlineManager.setOnline(state.isConnected != null && state.isConnected && Boolean(state.isInternetReachable));
      });
    }
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.rootContainer} onLayout={onLayoutRootView}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* maybe add a custom splash screen animation here */}
        <QueryClientProvider client={queryClient}>
          <Tabs
            screenOptions={({ route }) => ({
              headerShown: true,
              headerStyle: {
                opacity: 0,
              },
              headerStatusBarHeight: 15,
              headerShadowVisible: false,
              headerTransparent: true,
              headerBackground: () => <UnlonelyTopGradient />,
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'index') {
                  iconName = 'local-movies';
                } else if (route.name === 'live') {
                  iconName = 'ondemand-video';
                } else if (route.name === 'schedule') {
                  iconName = 'calendar-today';
                }

                return <MaterialIcons name={iconName} size={size} color={color} />;
              },
              // tabBarBadge: route.name === 'live' ? '1' : null,
              // tabBarBadgeStyle: {
              //   backgroundColor: 'red',
              //   color: 'white',
              // },
              tabBarActiveTintColor:
                (route.name === 'index' && '#e2f979') ||
                (route.name === 'live' && '#95f9cf') ||
                (route.name === 'schedule' && '#db78e0'),
              tabBarInactiveTintColor: 'white',
              tabBarLabelStyle: {
                fontFamily: 'NeuePixelSans',
                fontSize: 13,
                textShadowColor: 'rgba(0,0,0,0.5)',
                textShadowOffset: { width: 2, height: 2 },
                textShadowRadius: 1,
              },
              tabBarStyle: {
                borderTopWidth: 0,
                position: 'absolute',
                height: 120,
                paddingTop: 40,
                elevation: 0,
              },
              tabBarBackground: () => <FadedTabBar />,
            })}
          >
            {/* Icons for the main bottom tab bar */}
            <Tabs.Screen name="index" options={{ title: 'NFCs' }} />
            <Tabs.Screen name="live" options={{ title: 'stream' }} />
            <Tabs.Screen name="schedule" options={{ title: 'upcoming' }} />
          </Tabs>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </View>
  );
}

const { colors, locations } = easeGradient({
  // Eased gradient function so it doesn’t look like garbage
  colorStops: {
    0: {
      color: '#000',
    },
    1: {
      color: 'transparent',
    },
  },
});

const UnlonelyTopGradient = () => (
  // Unlonely branded gradient that shows up at the top of the screen
  <View style={styles.rootContainer}>
    <LinearGradient
      colors={['#e2f979', '#b0e5cf', '#ba98d7', '#d16fce']}
      end={[1, 0]}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  </View>
);

const FadedTabBar = () => (
  // Custom tab bar background that fades out at the top
  <View style={styles.rootContainer}>
    <LinearGradient
      colors={colors}
      locations={locations}
      start={[0, 1]}
      end={[0, 0]}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  </View>
);

const styles = StyleSheet.create({
  rootContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
});
