import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chat } from '../../components/stream/chat';
import { StreamPlayer } from '../../components/video/streamPlayer';
import { MotiView } from 'moti';
import { useLiveSettingsStore } from '../../utils/store/liveSettingsStore';

export default function LiveScreen() {
  const { isChatExpanded } = useLiveSettingsStore(z => ({
    isChatExpanded: z.isChatExpanded,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <MotiView
        animate={{
          marginTop: isChatExpanded ? -190 : 0,
        }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 180,
        }}
      >
        <StreamPlayer />
      </MotiView>
      <Chat />
      <View
        // this is a hack to make the webview not go under the tab bar
        // should be removed on android or tweaked so it doesn't show tab bar
        // when chat is focused and keyboard is open
        style={{
          backgroundColor: 'black',
          height: 60,
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
