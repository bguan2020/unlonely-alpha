import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useChannels } from '../../../api/queries/useChannels';
import { AnimatedPressable } from '../../../components/buttons/animatedPressable';
import { LinearGradient } from 'expo-linear-gradient';
import { easeGradient } from 'react-native-easing-gradient';
import { UnlonelyTopGradient } from '../../../components/nav/topGradient';
import { Ionicons } from '@expo/vector-icons';

type Channel = {
  awsId: string;
  isLive: boolean;
  name: string;
  owner: {
    FCImageUrl: string;
    address: string;
    lensImageUrl: string;
    username: string;
  };
  slug: string;
  thumbnailUrl: string | null;
};

export default function ChannelsIndex() {
  const { height } = useWindowDimensions();
  const router = useRouter();
  const { status, data, error, isFetching } = useChannels();
  const channels = data?.getChannelFeed;
  const liveChannels = channels?.filter((channel: Channel) => channel.isLive);
  const offlineChannels = channels?.filter((channel: Channel) => !channel.isLive);
  const anyLive = liveChannels?.length > 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.main}>
        {anyLive && (
          <View>
            <Text style={styles.title}>Online</Text>
            <View
              style={{
                marginBottom: 24,
              }}
            >
              {liveChannels?.map((channel: Channel) => (
                <ChannelTile
                  key={channel.awsId}
                  channel={channel}
                  onPress={() => {
                    router.push({
                      pathname: `/channels/[awsId]`,
                      params: {
                        awsId: channel.awsId,
                        name: channel.name,
                        slug: channel.slug,
                        thumbnailUrl: encodeURIComponent(channel.thumbnailUrl),
                      },
                    });
                  }}
                />
              ))}
            </View>
          </View>
        )}
        {status === 'loading' ? (
          <View
            style={{
              height: height - 140,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" color="white" />
            <Text style={[styles.title, styles.subtitle, { paddingTop: 16, paddingLeft: 0 }]}>loading channels...</Text>
          </View>
        ) : (
          <View>
            <Text style={[styles.title, styles.subtitle]}>All Channels</Text>
            {offlineChannels?.map((channel: Channel) => (
              <ChannelTile
                key={channel.awsId}
                channel={channel}
                onPress={() => {
                  router.push({
                    pathname: `/channels/[awsId]`,
                    params: {
                      awsId: channel.awsId,
                      name: channel.name,
                      slug: channel.slug,
                      thumbnailUrl: encodeURIComponent(channel.thumbnailUrl),
                    },
                  });
                }}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

type ChannelTileProps = {
  channel: Channel;
  onPress: () => void;
};

const ChannelTile = ({ channel, onPress }: ChannelTileProps) => {
  return (
    <AnimatedPressable onPress={onPress} minimal>
      {channel.isLive ? (
        <View>
          <View
            style={{
              borderRadius: 10,
              borderColor: '#222',
              borderWidth: 1,
              marginBottom: 16,
            }}
          >
            <Image
              source={channel.thumbnailUrl}
              style={{
                width: '100%',
                height: 200,
                backgroundColor: '#131313',
                borderRadius: 8,
              }}
            />
            <View
              style={{
                position: 'absolute',
                height: '100%',
                width: '100%',
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 2,
                  paddingBottom: 24,
                }}
              >
                <Ionicons name="md-play" size={64} color="white" />
              </View>
              <View
                style={{
                  position: 'absolute',
                  width: 50,
                  height: 24,
                  borderRadius: 6,
                  top: 8,
                  right: 9,
                  overflow: 'hidden',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <UnlonelyTopGradient />
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'NeuePixelSans',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    color: 'black',
                    textAlign: 'center',
                    paddingLeft: 2,
                  }}
                >
                  Live
                </Text>
              </View>
              <FadedOverlay />
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                padding: 8,
              }}
            >
              <ChannelInfo channel={channel} size="small" />
            </View>
          </View>
        </View>
      ) : (
        <View
          style={{
            paddingVertical: 12,
          }}
        >
          <ChannelInfo channel={channel} size="big" />
        </View>
      )}
    </AnimatedPressable>
  );
};

export const ChannelInfo = ({ channel, size }: { channel: Channel; size: 'big' | 'small' }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Image
        style={{
          width: size === 'big' ? 50 : 40,
          height: size === 'big' ? 50 : 40,
          borderRadius: 8,
          backgroundColor: '#222',
        }}
        source={channel.owner.FCImageUrl || `https://ensdata.net/media/avatar/${channel.owner.address}`}
      />
      <View
        style={{
          paddingLeft: size === 'big' ? 12 : 8,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontFamily: 'NeuePixelSans',
            letterSpacing: 0.5,
            color: 'white',
            textAlign: 'left',
          }}
        >
          {channel.name}
        </Text>
        {channel.owner.username && (
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'NeuePixelSans',
              letterSpacing: 0.75,
              color: 'rgba(255,255,255,0.4)',
              textAlign: 'left',
            }}
          >
            {channel.owner.username}
          </Text>
        )}
      </View>
    </View>
  );
};

export const FadedOverlay = () => (
  <View style={StyleSheet.absoluteFillObject}>
    <LinearGradient
      colors={colors}
      locations={locations}
      start={[0, 1]}
      end={[0, 0]}
      style={{
        width: '100%',
        height: '120%',
        position: 'absolute',
        bottom: 0,
      }}
    />
  </View>
);

const { colors, locations } = easeGradient({
  // Eased gradient function so it doesn’t look like garbage
  colorStops: {
    0: {
      color: 'rgba(0,0,0,0.85)',
    },
    1: {
      color: 'transparent',
    },
  },
});

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
  center: {
    flex: 1,
    height: 800,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: 'NeuePixelSans',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#e2f979',
    textAlign: 'left',
    marginBottom: 8,
    paddingLeft: 4,
  },
  subtitle: {
    color: '#666',
  },
  empty: {
    paddingVertical: 8,
    marginVertical: 8,
    marginBottom: 32,
    backgroundColor: '#111',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
