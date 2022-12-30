import BottomSheet from '@gorhom/bottom-sheet';
import { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import WebView from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserCredentials } from '../../utils/useUserCredentials';

export default function SettingsScreen() {
  const { height, width } = useWindowDimensions();
  const { userCredentials, storeCredentials } = useUserCredentials();

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  // const snapPoints = useMemo(() => [500], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);

    // if -1 then reload the webview
  }, []);

  // const catchWebViewNavigationStateChange = (newNavState: any) => {
  //   const { url } = newNavState;

  //   if (url !== CHAT_WEBVIEW_URL) {
  //     webViewRef.current.stopLoading();
  //     webViewRef.current.reload();
  //   }
  // };

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Settings</Text>
        <Pressable
          onPress={() => {
            storeCredentials(null);
            console.log('clearing user data');
          }}
        >
          <Text style={styles.subtitle}>Clear AsyncStorage</Text>
        </Pressable>
        <Text style={styles.title}>{JSON.stringify(userCredentials)}</Text>
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={['90%']}
        onChange={handleSheetChanges}
        enablePanDownToClose
        bottomInset={100}
        backgroundStyle={{
          backgroundColor: 'transparent',
        }}
        detached
        handleIndicatorStyle={{
          backgroundColor: 'white',
          top: 20,
          opacity: 0,
        }}
        style={{
          shadowOffset: {
            width: 0,
            height: -10,
          },
          shadowColor: 'black',
          shadowOpacity: 0.5,
          shadowRadius: 20,
        }}
      >
        <View
          style={{
            flex: 1,
            borderRadius: 42,
            overflow: 'hidden',
            backgroundColor: 'transparent',
          }}
        >
          <WebView
            contentMode="mobile"
            overScrollMode="never"
            scalesPageToFit={false}
            setBuiltInZoomControls={false}
            setDisplayZoomControls={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            zoomScale={1}
            source={{ uri: 'https://unlonely.app/mobile/connect-wallet' }}
            onMessage={event => {
              // alert(event.nativeEvent.data);
              const { data } = event.nativeEvent;
              storeCredentials(data);
            }}
            style={{
              height: '100%',
              width: width,
              backgroundColor: 'transparent',
              overflow: 'hidden',
            }}
          />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  main: {
    width: '100%',
    paddingHorizontal: 8,
    paddingTop: 76,
    paddingBottom: 100,
  },
  title: {
    fontSize: 16,
    fontFamily: 'NeuePixelSans',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#e2f979',
    textAlign: 'left',
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'NeuePixelSans',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: 'white',
    textAlign: 'left',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
});
