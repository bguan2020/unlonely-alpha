import { StyleSheet, Text, View, FlatList, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FlashList } from '@shopify/flash-list';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useHeaderHeight } from '@react-navigation/elements';
import { useRef } from 'react';
import { Canvas, Blur, Image, ColorMatrix, useImage } from '@shopify/react-native-skia';
import { FullscreenNfc } from '../../components/nfc/fullscreenNfc';

const videos = [
  { title: 'what', uri: 'https://openseauserdata.com/files/a6a670a774daa53609617b4e0b3b48df.mp4' },
  { title: 'the', uri: 'https://openseauserdata.com/files/48e7cfd0444aafa87c583468d185805b.mp4' },
  {
    title: 'fuck',
    uri: 'https://openseauserdata.com/files/4847865b3694e441dd7a2f6b55f4bc49.mp4',
  },
  { title: 'is', uri: 'https://openseauserdata.com/files/be12a738051e69852ba575487f1e9022.mp4' },
  { title: 'happening', uri: 'https://openseauserdata.com/files/43a01fa59e1721992f8652ed4d003b35.mp4' },
];

const data = [1, 2, 3, 4, 5, 6];

export default function NfcFeedScreen() {
  const { height, width } = useWindowDimensions();
  // const headerHeight = useHeaderHeight();
  // const tabBarHeight = useBottomTabBarHeight();
  // const availableHeight = height - tabBarHeight - headerHeight;
  const videoRefs = useRef([]);
  const onViewableItemsChanged = useRef(({ changed }) => {
    changed.forEach(element => {
      const cell = videoRefs.current[element.key];

      if (cell) {
        if (element.isViewable) {
          cell.play();
        } else {
          cell.pause();
        }
      }
    });
  });

  const nfcVideoRenderItem = ({ item, index }) => {
    return (
      <FullscreenNfc
        uri={videos[index]?.uri}
        ref={ref => (videoRefs.current[item] = ref)}
        height={height}
        width={width}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <FlashList
        data={data}
        removeClippedSubviews
        renderItem={nfcVideoRenderItem}
        estimatedItemSize={height}
        pagingEnabled
        keyExtractor={item => item}
        decelerationRate={'fast'}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 80,
        }}
        onViewableItemsChanged={onViewableItemsChanged.current}
      />
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
});
