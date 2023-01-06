import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FlashList } from '@shopify/flash-list';
import { useRef } from 'react';
import { FullscreenNfc } from '../../components/nfc/fullscreenNfc';
import { useNfcFeed } from '../../api/queries/useNfcFeed';
import { useHaptics } from '../../utils/haptics';
import { FeedNav } from '../../components/nav/feedNav';
import { UnlonelyTopGradientWithLogo } from '../../components/nav/topGradient';

export default function NfcFeedScreen() {
  const { height, width } = useWindowDimensions();
  const videoRefs = useRef([]);
  const { status, data, error, isFetching } = useNfcFeed({
    limit: 9,
  });
  const nfcs = data?.getNFCFeed;
  const onViewableItemsChanged = useRef(({ changed }) => {
    changed.forEach(element => {
      const nfcItem = videoRefs.current[element.item.id];

      if (nfcItem) {
        if (element.isViewable) {
          nfcItem.play();
          useHaptics('light');
        } else {
          nfcItem.pause();
        }
      }
    });
  });

  const nfcVideoRenderItem = ({ item }) => {
    return <FullscreenNfc item={item} ref={ref => (videoRefs.current[item.id] = ref)} height={height} width={width} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* animate ↓ this in with reanimated with a 10 second delay after the app loads */}
      <UnlonelyTopGradientWithLogo />
      <FlashList
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
      <View
        style={{
          position: 'absolute',
          zIndex: -1,
          bottom: -15,
          left: 0,
          right: 0,
        }}
      >
        <Text style={styles.hiddenMessage}>that’s it. you’re done.</Text>
        {/* animate ↑ this in with reanimated with a 10 second delay after the app loads */}
      </View>
      <FeedNav />
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
});
