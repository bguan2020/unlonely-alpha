import { useCallback, useEffect } from 'react';
import { Stack, Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { AppState, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { easeGradient } from 'react-native-easing-gradient';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClientProvider } from 'react-query';
import { onAppStateChange, queryClient } from '../../utils/api';

const { colors, locations } = easeGradient({
  colorStops: {
    0: {
      color: '#000',
    },
    1: {
      color: 'transparent',
    },
  },
});

export default function Layout() {
  const [fontsLoaded] = useFonts({
    NeuePixelSans: require('../../assets/fonts/NeuePixelSans.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  // useEffect(() => {
  //   const subscription = AppState.addEventListener('change', onAppStateChange);

  //   return () => subscription.remove();
  // }, []);

  return (
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
          headerBackground: () => (
            <View
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
              }}
            >
              <LinearGradient
                colors={['#e2f979', '#b0e5cf', '#ba98d7', '#d16fce']}
                end={[1, 0]}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            </View>
          ),
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
          tabBarActiveTintColor: '#e2f979',
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
          tabBarBackground: () => (
            // <BlurView
            //   tint="dark"
            //   intensity={42}
            //   style={{
            //     position: 'absolute',
            //     left: 0,
            //     top: 0,
            //     right: 0,
            //     bottom: 0,
            //   }}
            // >
            //   <View
            //     style={{
            //       position: 'absolute',
            //       left: 0,
            //       top: 0,
            //       right: 0,
            //       bottom: 0,
            //       backgroundColor: 'black',
            //       opacity: 0.25,
            //     }}
            //   ></View>
            // </BlurView>
            <View
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
              }}
            >
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
          ),
        })}
      >
        <Tabs.Screen name="index" options={{ title: 'NFCs' }} />
        <Tabs.Screen name="live" options={{ title: 'stream' }} />
        <Tabs.Screen name="schedule" options={{ title: 'upcoming' }} />
      </Tabs>
    </QueryClientProvider>
  );
}
