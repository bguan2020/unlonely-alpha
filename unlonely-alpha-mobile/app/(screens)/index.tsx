import { StyleSheet, Text, View, useWindowDimensions, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FlashList } from '@shopify/flash-list';
import { useEffect, useRef, useState } from 'react';
import { FullscreenNfc } from '../../components/nfc/fullscreenNfc';
import { useNfcFeed } from '../../api/queries/useNfcFeed';
import { useHaptics } from '../../utils/haptics';
import { FeedNav } from '../../components/nav/feedNav';
import { UnlonelyTopGradientWithLogo } from '../../components/nav/topGradient';
import { useAppSettingsStore } from '../../utils/store/appSettingsStore';
import { useVideoPlayerStore } from '../../utils/store/videoPlayerStore';
import { CoinbaseSheet } from '../../components/settings/coinbaseSheet';
import { useUserStore } from '../../utils/store/userStore';

export default function NfcFeedScreen() {
  const { height, width } = useWindowDimensions();
  const [showBacksplash, setShowBacksplash] = useState(true);
  const videoRefs = useRef([]);
  const isNfcAutoplayEnabled = useAppSettingsStore(z => z.isNfcAutoplayEnabled);
  const { isNFCPlaying, startNFCPlaying, stopNFCPlaying } = useVideoPlayerStore(z => ({
    startNFCPlaying: z.startNFCPlaying,
    isNFCPlaying: z.isNFCPlaying,
    stopNFCPlaying: z.stopNFCPlaying,
  }));
  const { userData } = useUserStore(z => ({ userData: z.userData }));
  const nfcFeedSorting = useAppSettingsStore(z => z.nfcFeedSorting);
  const [queryKey, setQueryKey] = useState<string>(`${nfcFeedSorting}-${userData?.address}`);
  const { data, isFetching } = useNfcFeed(queryKey, {
    limit: 50,
    orderBy: nfcFeedSorting,
  });
  const nfcs = data?.getNFCFeed;

  const onViewableItemsChanged = useRef(({ changed }) => {
    try {
      // console.log('---- changing NFC in feed ----');
      changed.forEach((element): any => {
        const nfcItem = videoRefs.current[element.item.id];
        if (nfcItem) {
          if (element.isViewable) {
            // nfcItem.play();
            useHaptics('light');
          } else {
            nfcItem.pause();
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  });

  useEffect(() => {
    if (nfcs?.length > 0) {
      setTimeout(() => {
        // hide dark backsplash after 10 seconds
        setShowBacksplash(false);
      }, 10000);
    }

    if (isFetching) {
      setShowBacksplash(true);
    }

    // if (nfcs?.length > 0 && isNfcAutoplayEnabled) {
    //   // console.log('== starting NFC playback ==');
    //   setTimeout(() => {
    //     startNFCPlaying();
    //   }, 1000);
    // } else {
    //   // console.log('== stopping NFC playback ==');
    //   stopNFCPlaying();
    // }
  }, [nfcs, isNfcAutoplayEnabled, isFetching]);

  useEffect(() => {
    setShowBacksplash(true);
    setQueryKey(`${nfcFeedSorting}-${userData?.address}`);
  }, [userData?.address]);

  useEffect(() => {
    if (nfcFeedSorting === queryKey) return;

    setShowBacksplash(true);
    setQueryKey(nfcFeedSorting);
  }, [nfcFeedSorting]);

  const nfcVideoRenderItem = ({ item }) => {
    return <FullscreenNfc item={item} ref={ref => (videoRefs.current[item.id] = ref)} height={height} width={width} />;
  };

  return (
    <View style={styles.container}>
      {/* animate ↓ this in with reanimated with a 10 second delay after the app loads */}
      <UnlonelyTopGradientWithLogo />
      <View
        style={{
          position: 'absolute',
          zIndex: -1,
          bottom: -15,
          left: 0,
          right: 0,
        }}
      >
        <Text style={styles.hiddenMessage}>that’s it for now.</Text>
        {/* animate ↑ this in with reanimated with a 10 second delay after the app loads */}
      </View>
      {showBacksplash && (
        <View
          style={{
            position: 'absolute',
            zIndex: -1,
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            paddingTop: 40,
            backgroundColor: 'black',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loading}>loading nfc...</Text>
        </View>
      )}
      <FlashList
        key={queryKey}
        data={nfcs}
        removeClippedSubviews
        renderItem={nfcVideoRenderItem}
        estimatedItemSize={height}
        pagingEnabled
        keyExtractor={nfc => nfc.id}
        decelerationRate={'fast'}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 80,
        }}
        onViewableItemsChanged={onViewableItemsChanged.current}
      />
      <FeedNav />
      <CoinbaseSheet />
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    height: '100%',
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'NeuePixelSans',
    paddingVertical: 24,
    paddingHorizontal: 24,
    bottom: 80,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  hiddenMessage: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'NeuePixelSans',
    paddingVertical: 24,
    paddingHorizontal: 24,
    bottom: 80,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  loading: {
    fontSize: 16,
    fontFamily: 'NeuePixelSans',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#666',
    textAlign: 'left',
    marginTop: 16,
  },
});
