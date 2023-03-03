import { differenceInSeconds } from 'date-fns';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUpcomingSchedule } from '../../api/queries/useUpcomingSchedule';
import { Chat } from '../../components/stream/chat';
import { NextStreamBanner } from '../../components/stream/nextStreamBanner';
import { StreamPlayer } from '../../components/video/streamPlayer';
import { MotiView } from 'moti';
import { useLiveSettingsStore } from '../../utils/store/liveSettingsStore';

export default function LiveScreen() {
  const { data } = useUpcomingSchedule({
    limit: 3,
  });
  const schedule = data?.getHostEventFeed;
  // const schedule = [
  //   {
  //     challenge: null,
  //     description: 'product launch + ama',
  //     disliked: null,
  //     hostDate: '2023-01-24T15:49:00.000Z',
  //     id: '86',
  //     liked: null,
  //     owner: {
  //       FCImageUrl:
  //         'https://i.seadn.io/gae/T1n8naiIITR2TKLlRyPHDEkKIRhO01WwsTJBfv1_YeUeVbtPnSlhe4MqWuYo0tMyDj9HWV3t3vJYBEKEHVeKHXYo4XIFxqSFfgEVbQ?w=500&auto=format',
  //       username: 'br1an.eth',
  //     },
  //     score: 6,
  //     title: 'highlight w/ @emodi',
  //   },
  //   {
  //     challenge: null,
  //     description: 'come hang after a long day of work!',
  //     disliked: null,
  //     hostDate: '2023-01-06T03:00:00.000Z',
  //     id: '85',
  //     liked: null,
  //     owner: {
  //       FCImageUrl:
  //         'https://i.seadn.io/gae/T1n8naiIITR2TKLlRyPHDEkKIRhO01WwsTJBfv1_YeUeVbtPnSlhe4MqWuYo0tMyDj9HWV3t3vJYBEKEHVeKHXYo4XIFxqSFfgEVbQ?w=500&auto=format',
  //       username: 'br1an.eth',
  //     },
  //     score: 13,
  //     title: 'New Year New Brian',
  //   },
  // ];
  const [showBanner, setShowBanner] = useState(false);
  const { isChatExpanded } = useLiveSettingsStore(z => ({
    isChatExpanded: z.isChatExpanded,
  }));

  useEffect(() => {
    if (schedule && schedule[0]?.hostDate) {
      const inTheFuture = differenceInSeconds(new Date(schedule[0].hostDate), new Date()) > 5;
      setShowBanner(inTheFuture);
    }
  }, [schedule]);

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
      {showBanner && <NextStreamBanner hostDate={schedule[0]?.hostDate} />}
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
