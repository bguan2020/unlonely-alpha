import { useCallback, useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Platform, View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { queryClient } from '../../api/client';
import NetInfo from '@react-native-community/netinfo';
import { useAppState } from '../../utils/useAppState';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toasts } from '@backpackapp-io/react-native-toast';
import { UnlonelyTopGradient } from '../../components/nav/topGradient';
import { FadedTabBar } from '../../components/nav/bottomGradient';
import { StatusBar } from 'expo-status-bar';
// import overrideColorScheme from 'react-native-override-color-scheme';
import * as Notifications from 'expo-notifications';
import { initializeNotificationSettings } from '../../utils/notifications';

initializeNotificationSettings();

export default function Layout() {
  // Load up the fonts as early as possible
  const [fontsLoaded] = useFonts({
    NeuePixelSans: require('../../assets/fonts/NeuePixelSans.ttf'),
  });
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      // do some splash screen animation here
      console.log('======== FONTS LOADED ==================================');

      // overrideColorScheme.setScheme('dark');
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

  useEffect(() => {
    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      notificationCommonHandler(notification);
    });

    // This listener is fired whenever a user taps on or interacts with a notification
    // (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      notificationCommonHandler(response.notification);
      notificationNavigationHandler(response.notification.request.content);
    });

    // The listeners must be clear on app unmount
    return () => {
      // @ts-ignore
      Notifications.removeNotificationSubscription(notificationListener);
      // @ts-ignore
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const notificationCommonHandler = notification => {
    console.log('A notification has been received', notification);
  };

  const notificationNavigationHandler = ({ data }) => {
    // navigate to app screen
    console.log('A notification has been touched', data);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={StyleSheet.absoluteFillObject} onLayout={onLayoutRootView}>
        <StatusBar style="dark" />
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
                height: 80,
                paddingTop: 0,
                elevation: 0,
              },
              tabBarBackground: () => <FadedTabBar />,
            })}
          >
            <Tabs.Screen name="index" options={{ title: 'NFCs' }} />
            <Tabs.Screen name="live" options={{ title: 'stream' }} />
            {/* <Tabs.Screen name="schedule" options={{ title: 'upcoming' }} /> */}
          </Tabs>
          <Toasts />
        </QueryClientProvider>
      </View>
    </GestureHandlerRootView>
  );
}
