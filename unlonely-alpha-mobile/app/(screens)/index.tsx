import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FlashList } from '@shopify/flash-list';
import { useRef } from 'react';
import { FullscreenNfc } from '../../components/nfc/fullscreenNfc';
import { useNfcFeed } from '../../api/queries/useNfcFeed';
import { useHaptics } from '../../utils/haptics';

export default function NfcFeedScreen() {
  const { height, width } = useWindowDimensions();
  const videoRefs = useRef([]);
  const { status, data, error, isFetching } = useNfcFeed({
    limit: 3,
  });
  const nfcs = data?.getNFCFeed;

  const onViewableItemsChanged = useRef(({ changed }) => {
    changed.forEach(element => {
      const cell = videoRefs.current[element];

      console.warn('================');
      console.log(cell);
      console.log(element);

      if (cell) {
        if (element.isViewable) {
          cell.play();
          useHaptics('light');
        } else {
          cell.pause();
        }
      }
    });
  });

  const nfcVideoRenderItem = ({ item }) => {
    return <FullscreenNfc item={item} ref={ref => (videoRefs.current[item] = ref)} height={height} width={width} />;
  };

  console.log({ status, error, isFetching });

  // if (data) {
  //   console.log(nfcs[0].videoLink);
  // }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <FlashList
        data={nfcs}
        removeClippedSubviews
        renderItem={nfcVideoRenderItem}
        estimatedItemSize={height}
        pagingEnabled
        keyExtractor={item => item.id}
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
      </View>
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
