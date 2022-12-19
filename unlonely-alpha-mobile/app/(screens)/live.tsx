import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import IVSPlayer, { IVSPlayerRef } from 'amazon-ivs-react-native-player';
import { useRef } from 'react';
import { statusBarHeight } from '../../utils/statusbar';

export default function LiveScreen() {
  const mediaPlayerRef = useRef<IVSPlayerRef>(null);

  const togglePip = () => {
    console.log('toggling pip');
    mediaPlayerRef.current?.togglePip();
  };

  const handlePause = () => {
    mediaPlayerRef.current?.pause();
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.videoContainer,
          {
            width: '100%',
            height: Dimensions.get('window').width * (9 / 16),
          },
        ]}
      >
        <IVSPlayer
          style={styles.video}
          resizeMode={'aspectFit'}
          streamUrl={
            'https://0ef8576db087.us-west-2.playback.live-video.net/api/video/v1/us-west-2.500434899882.channel.8e2oKm7LXNGq.m3u8'
          }
          onLiveLatencyChange={latency => {
            console.log('live latency: ', latency);
          }}
          autoplay={true}
          liveLowLatency={true}
          ref={mediaPlayerRef}
        />
      </View>
      <Pressable onPress={togglePip}>
        <Text style={styles.pip}>Toggle PiP</Text>
      </Pressable>

      <Pressable onPress={handlePause}>
        <Text style={styles.pip}>Pause</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ccc',
    paddingTop: statusBarHeight,
  },
  videoContainer: {
    // height: 400,
    backgroundColor: 'red',
  },
  video: {
    // width: '100%',
    // height: '100%',
  },
  pip: {
    fontSize: 20,
    color: 'black',
    margin: 20,
  },
});
