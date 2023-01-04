import BottomSheet from '@gorhom/bottom-sheet';
import { useCallback, useRef } from 'react';
import { useWindowDimensions, View } from 'react-native';
import WebView from 'react-native-webview';
import { useUserCredentials } from '../../utils/useUserCredentials';

export function ConnectKitSheet() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { height, width } = useWindowDimensions();
  const { userCredentials, storeCredentials } = useUserCredentials();

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
    <>
      {/* <View style={styles.main}>
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
      </View> */}
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
    </>
  );
}
