import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { VoteControls } from './voteControls';

type ScheduleCardProps = {
  id: string;
  title: string;
  description: string;
  hostDate: string;
  owner: {
    username: string;
    FCImageUrl: string;
  };
  score: number;
  liked: boolean;
  disliked: boolean;
  challenge?: {
    id: string;
    title: string;
    description: string;
    hostDate: string;
    owner: {
      username: string;
      FCImageUrl: string;
    };
    score: number;
    liked: boolean;
    disliked: boolean;
  };
};

export const ScheduleCard = () => {
  return (
    <View style={styles.container}>
      <View style={styles.timeInfo}>
        <View style={styles.timeRelative}>
          <Text style={styles.timeRelativeText}>in 12h 15m</Text>
        </View>
        <View style={styles.timeAbsolute}>
          <Text style={styles.timeAbsoluteText}>Wednesday, Dec 14 7:00 PM</Text>
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.streamInfo}>
          <Image
            source={{
              uri: 'https://source.unsplash.com/random/200x200',
            }}
            style={styles.avatar}
          />
          <Text style={styles.streamOwner}>br1an.eth</Text>
          <Text style={styles.streamTitle}>the brian show must go on</Text>
          <Text style={styles.streamDescription}>talking about the mysterious egg</Text>
        </View>
        <View style={[styles.streamInfo, styles.streamInfoChallenger]}>
          <Image
            source={{
              uri: 'https://source.unsplash.com/random/200x200',
            }}
            style={styles.avatar}
          />
          <Text style={styles.streamOwner}>borodutch.eth</Text>
          <Text style={styles.streamTitle}>telegram sucks</Text>
          <Text style={styles.streamDescription}>...</Text>
        </View>
        <View style={styles.versus}>
          <Text style={styles.versusText}>VS</Text>
        </View>
      </View>
      <View style={styles.votingCardContainer}>
        {/* when clock runs out and you tap on this whole element, a bottom sheet pops up that voting has ended */}
        <View style={styles.votingCard}>
          <VoteControls />
          <View style={styles.votingCountdown}>
            <View>
              <AntDesign name="clockcircleo" size={16} color="white" />
              <MaterialIcons name="lock-outline" size={16} color="white" />
              <Text style={styles.votingCountdownText}>00:00:00</Text>
            </View>
          </View>
          <VoteControls />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  card: {
    backgroundColor: '#111',
    borderColor: '#222',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    shadowColor: 'red',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  streamInfo: {
    width: '100%',
    padding: 16,
    flexShrink: 1,
    alignItems: 'center',
  },
  streamInfoChallenger: {
    left: 1,
    borderLeftColor: '#222',
    borderLeftWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 100,
  },
  streamOwner: {
    textAlign: 'center',
    fontFamily: 'NeuePixelSans',
    color: 'white',
    paddingTop: 8,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  streamTitle: {
    textAlign: 'center',
    fontFamily: 'NeuePixelSans',
    color: '#db78e0',
    paddingTop: 8,
    fontSize: 16,
    lineHeight: 16,
  },
  streamDescription: {
    textAlign: 'center',
    fontFamily: 'NeuePixelSans',
    color: '#999',
    paddingTop: 4,
    fontSize: 12,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  versus: {
    backgroundColor: '#222',
    position: 'absolute',
    left: '50%',
    top: 34,
    width: 33,
    height: 33,
    borderRadius: 100,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  versusText: {
    position: 'absolute',
    color: '#fff',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    fontFamily: 'NeuePixelSans',
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  timeRelative: {},
  timeRelativeText: {
    color: '#fff',
    fontFamily: 'NeuePixelSans',
    letterSpacing: 0.5,
  },
  timeAbsolute: {},
  timeAbsoluteText: {
    color: '#666',
    fontFamily: 'NeuePixelSans',
    letterSpacing: 0.5,
  },
  votingCardContainer: {
    paddingHorizontal: 16,
  },
  votingCard: {
    backgroundColor: '#111',
    padding: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  votingControls: {
    flexDirection: 'row',
  },
  votingControlsText: {
    color: 'white',
  },
  votingButton: {},
  votingCountdown: {},
  votingCountdownText: {
    color: 'white',
  },
});
