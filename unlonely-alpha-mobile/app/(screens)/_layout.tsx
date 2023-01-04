import { useCallback, useEffect } from 'react';
import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Platform, View, StyleSheet, AppState, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { easeGradient } from 'react-native-easing-gradient';
import { useFonts } from 'expo-font';
import { QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { queryClient } from '../../api/client';
import NetInfo from '@react-native-community/netinfo';
import { useAppState } from '../../utils/useAppState';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toasts } from '@backpackapp-io/react-native-toast';
import Svg, { SvgProps, Defs, Path } from 'react-native-svg';

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
                height: 80,
                paddingTop: 0,
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
          <Toasts />
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

const UnlonelyLogo = (props: SvgProps) => (
  <Svg id="unlonely-logo" viewBox="0 0 1072.45 236.81" {...props}>
    <Path
      d="M323.04 172.45h10.69v10.69h37.5v-10.69h10.7v10.69h21.46V76.06h-21.46v75h-10.7v10.69h-26.8v-10.69h-10.7v-75h-21.39v85.69h10.7v10.7zM446.16 108.14h10.69V97.45h26.81v10.69h10.69v75h21.46V97.45h-10.69v-10.7h-10.77V76.06h-37.5v10.69h-10.69V76.06h-21.39v107.08h21.39v-75zM537.2 33.14h21.39v150H537.2zM590.67 172.45h10.69v10.69h53.61v-10.69h10.69v-10.69h10.69V97.45h-10.69V86.76h-10.69V76.07h-53.61v10.69h-10.69v10.69h-10.69v64.31h10.69v10.69Zm10.69-64.31h10.69V97.45h32.15v10.69h10.77v42.92H644.2v10.69h-32.15v-10.69h-10.69v-42.92ZM719.13 108.14h10.7V97.45h26.8v10.69h10.7v75h21.46V97.45h-10.7v-10.7h-10.76V76.06h-37.5v10.69h-10.7V76.06h-21.38v107.08h21.38v-75zM820.87 172.45h10.69v10.69h53.61v-10.69h10.69v-10.69h10.69v-10.69H874.4v10.69h-32.15v-10.69h-10.69v-16.11h75v-37.5h-10.69V86.77h-10.69V76.08h-53.61v10.69h-10.69v10.69h-10.69v64.31h10.69v10.69Zm10.69-64.31h10.69V97.45h32.15v10.69h10.77v10.77h-53.61v-10.77ZM927.95 33.14h21.39v150h-21.39z"
      fill="rgba(255,255,255,0.5)"
    />
    <Path
      d="M1051.07 76.06v21.39h-10.7v21.46h-10.76v21.38h-21.39v-21.38h-10.77V97.45h-10.69V76.06h-21.39v21.39h10.7v21.46h10.69v21.38h10.69v21.46h10.77v21.39h-10.77v21.39h-32.08v10.78H280.18v10.74h-21.52v10.76h21.52v-.04h696.03v-10.78h21.24v-10.77h10.77v-10.69h10.69v-21.39h10.7v-21.39h10.76v-21.46h10.7v-21.38h10.69V97.45h10.69V76.06h-21.38zM64.89 215.3v10.77h10.77v-21.53H64.89v10.76zM75.66 193.77v10.77h10.76v-21.53H75.66v10.76zM86.42 172.24v10.77h10.77v-21.53H86.42v10.76zM97.19 150.71v10.77h10.76v-21.53H97.19v10.76zM215.6 150.71v-10.76h-10.76v21.53h10.76v-10.77zM97.19 118.42H86.42V53.94H75.66v64.55h10.76v21.46h10.77v-21.53zM118.72 64.61h10.77v10.77h-10.77zM172.54 64.61h-10.76v10.76h10.76v-.01h21.53V64.59h-21.53v.02zM129.48 53.84h10.77v10.77h-10.77zM118.72 107.72V86.19h-10.77v32.3h10.77v-10.77zM204.84 107.72V86.19h-10.77V118.42h10.77v-10.7zM183.31 129.14v10.77h10.76v-21.46h-10.76v10.69zM226.37 172.28v-10.77H215.6v21.46h10.77v-10.69zM237.13 215.26v10.77h10.77v-21.46h-10.77v10.69zM226.35 226.05H215.6v10.76h21.52v-10.76h-10.77zM54.12 226.05H43.37v10.76H64.88v-10.76H54.12zM237.13 193.81v-10.77h-10.76v21.46h10.76v-10.69zM161.78 139.95v10.76h21.53v-10.76h-21.53zM140.25 150.71h-21.53v10.77h43.06v-10.77h-21.53zM204.84 21.53h10.77v10.76h-10.77zM194.07 10.77h10.77v10.77h-10.77zM215.6 53.83h10.77V32.29H215.6v21.54zM129.48 32.29H172.54V21.53h-64.59v10.76h21.53zM97.19 32.29h10.77v10.77H97.19zM86.42 43.06h10.77v10.77H86.42zM237.13 107.72V53.94h-10.76V118.45H215.6v21.46h10.77v-21.42h10.76v-10.77zM258.66 150.71v-10.76H247.9v21.53h10.76v-10.77zM269.43 172.28v-10.77h-10.77v21.46h10.77v-10.69zM280.19 193.81v-10.77h-10.76v21.46h10.76v-10.69zM247.9 21.53h10.76v10.76H247.9zM237.13 10.77h10.77v10.77h-10.77zM258.66 53.83h10.77V32.29h-10.77v21.54zM280.19 107.72V53.94h-10.76V118.45h-10.77v21.46h10.77v-21.42h10.76v-10.77zM64.59 150.71v-10.76H53.83v21.53h10.76v-10.77zM43.06 129.14v10.77h10.77v-21.46H43.07V53.94H32.31v64.55h10.75v10.65zM43.06 161.48h10.77v10.77H43.06z"
      fill="rgba(255,255,255,0.5)"
    />
    <Path
      d="M43.06 172.24h10.77v10.77H43.06zM21.53 215.26v10.77H32.3v-21.46H21.53v10.69zM10.77 226.05H.02v10.76H21.53v-10.76H10.77zM32.3 193.73v10.77h10.76v-21.46H32.3v10.69zM75.39 21.53V10.77H64.62v21.52h10.77V21.53zM53.85 32.29h10.77v10.77H53.85zM43.06 43.06h10.77v10.77H43.06z"
      fill="rgba(255,255,255,0.5)"
    />
    <Path
      d="M312.34 161.75h10.7v10.7h37.5v-10.7h10.69v10.7h21.46V65.37h-21.46v75h-10.69v10.69h-26.81v-10.69h-10.69v-75h-21.39v85.69h10.69v10.69zM435.46 97.45h10.7v-10.7h26.8v10.7h10.7v75h21.46v-85.7h-10.7V76.06h-10.76V65.37h-37.5v10.69h-10.7V65.37h-21.38v107.08h21.38v-75zM526.5 22.45h21.39v150H526.5zM579.97 161.75h10.69v10.69h53.61v-10.69h10.69v-10.69h10.69V86.75h-10.69V76.06h-10.69V65.37h-53.61v10.69h-10.69v10.69h-10.69v64.31h10.69v10.69Zm10.69-64.31h10.69V86.75h32.15v10.69h10.77v42.92H633.5v10.69h-32.15v-10.69h-10.69V97.44ZM708.44 97.45h10.69v-10.7h26.81v10.7h10.69v75h21.46v-85.7H767.4V76.06h-10.77V65.37h-37.5v10.69h-10.69V65.37h-21.39v107.08h21.39v-75zM810.17 161.75h10.69v10.69h53.61v-10.69h10.69v-10.69h10.69v-10.69H863.7v10.69h-32.15v-10.69h-10.69v-16.11h75v-37.5h-10.69V76.07h-10.69V65.38h-53.61v10.69h-10.69v10.69h-10.69v64.31h10.69v10.69Zm10.69-64.31h10.69V86.75h32.15v10.69h10.77v10.77h-53.61V97.44ZM917.25 22.45h21.39v150h-21.39z"
      fill="black"
    />
    <Path
      d="M1040.37 65.37v21.38h-10.69v21.46h-10.77v21.39h-21.38v-21.39h-10.77V86.75h-10.69V65.37h-21.39v21.38h10.69v21.46h10.7v21.39h10.69v21.46h10.77v21.39h-10.77v21.38h-32.08v10.77H280.19v-.06h-10.76v-21.53h-10.77v-21.53H247.9v-21.53h10.76v-21.53h10.77V53.83h-10.77V32.29H247.9V21.53h-10.77V10.77H215.6v21.52h10.77v10.77h10.76v10.77h10.77v64.59h-10.77v21.53h-10.76v21.53h10.76v21.53h10.77v21.53h10.76v21.53h21.53v-.01h685.26v-10.77h21.31v-10.76h10.77v-10.7h10.69v-21.38h10.69v-21.39h10.77V129.6h10.69v-21.39h10.7V86.75h10.69V65.37h-21.39z"
      fill="black"
    />
    <Path
      d="M204.84 21.53h-10.77V10.77h-21.53V0h-64.59v10.77H86.42v10.76H75.66v10.76H64.89v21.54H54.13v64.59h10.76v21.53h10.77v21.53H64.89v21.53H54.13v21.53H43.36v21.53h21.53v-21.53h10.77v-21.53h10.76v-21.53h10.77v-21.53H86.42v-21.53H75.66V53.83h10.76V43.06h10.77V32.29h10.76V21.53h64.59v10.76h10.77v10.77h10.76v10.77h10.77v64.59h-10.77v21.53h-10.76v21.53h10.76v21.53h10.77v21.53h10.76v21.53h21.53v-21.53h-10.76v-21.53H215.6v-21.53h-10.76v-21.53h10.76v-21.53h10.77V53.83H215.6V32.29h-10.76V21.53z"
      fill="black"
    />
    <Path
      d="M183.31 118.42h10.76V75.36h-21.53v43.06h-10.76v10.76H118.72v-10.76h-10.77V75.37h10.77V64.61h10.76V53.84h-10.76V43.08h-10.77v10.76H97.19v10.77h10.76v10.75H86.42v43.06h10.77v21.53h21.53v10.76h43.06v-10.76h21.53v-21.53z"
      fill="black"
    />
    <Path
      d="M172.54 64.59h10.77V53.83h-32.3v10.76h21.53zM53.83 150.71v-10.76H43.06v-21.53H32.3V53.83h10.76V43.06h10.77V32.29h10.76V10.77H43.06v10.76H32.3v10.76H21.53v21.54H10.77v64.59h10.76v21.53H32.3v21.53H21.53v21.53H10.77v21.53H0v21.53h21.53v-21.53H32.3v-21.53h10.76v-21.53h10.77v-10.77z"
      fill="black"
    />
  </Svg>
);

export const UnlonelyTopGradientWithLogo = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      height: 210,
      zIndex: -1,
      top: 0,
      left: 0,
      right: 0,
    }}
  >
    <LinearGradient
      colors={['#e2f979', '#b0e5cf', '#ba98d7', '#d16fce']}
      end={[1, 0]}
      style={{
        width: '100%',
        height: 360,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
      }}
    />
    <UnlonelyLogo width={160} height={100} />
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
        height: '140%',
        position: 'absolute',
        bottom: 0,
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
