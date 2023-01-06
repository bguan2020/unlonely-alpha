import { Ionicons } from '@expo/vector-icons';
import { Text, StyleSheet, View, Image } from 'react-native';
import { useConnectedWalletStore } from '../../utils/store';
import { AnimatedPressable } from '../buttons/animatedPressable';

const AVATAR_SIZE = 48;

export const UserSettings = () => {
  const { connectedWallet } = useConnectedWalletStore(z => ({
    connectedWallet: z.connectedWallet,
  }));

  return (
    <>
      <Text style={styles.title}>Connected Wallet</Text>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={styles.userRow}>
          <View
            style={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              borderRadius: 100,
              shadowColor: 'black',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.5,
              shadowRadius: 15,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: -4,
            }}
          >
            {connectedWallet ? (
              <View
                style={[
                  styles.floatingButton,
                  {
                    backgroundColor: 'rgba(0,0,0,0.15)',
                  },
                ]}
              >
                <Image
                  style={{
                    width: AVATAR_SIZE - 8,
                    height: AVATAR_SIZE - 8,
                    borderRadius: 100,
                    resizeMode: 'cover',
                  }}
                  source={{
                    uri: 'https://wojtek.im/face.jpg',
                  }}
                />
              </View>
            ) : (
              <View style={styles.floatingButton}>
                <Ionicons
                  name="ios-person"
                  size={20}
                  color="#e6f88a"
                  style={{
                    top: -1,
                    zIndex: 2,
                  }}
                />
              </View>
            )}
          </View>
          <View
            style={{
              paddingLeft: 12,
            }}
          >
            <Text style={styles.ensText}>pugson.eth</Text>
            <Text style={styles.addressText}>0x96a77...fa23</Text>
          </View>
        </View>
        <View>
          <AnimatedPressable style={styles.manageButton}>
            <Text style={styles.manageButtonText}>manage</Text>
          </AnimatedPressable>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontFamily: 'NeuePixelSans',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#e2f979',
    textAlign: 'left',
    marginTop: 16,
  },
  subtitle: {
    color: 'white',
    fontFamily: 'NeuePixelSans',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  floatingButton: {
    position: 'absolute',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 100,
    overflow: 'hidden',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
  },
  ensText: {
    color: 'white',
    fontFamily: 'NeuePixelSans',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  addressText: {
    color: '#666',
    fontFamily: 'NeuePixelSans',
    fontSize: 14,
  },
  manageButton: {
    backgroundColor: '#be47d1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  manageButtonText: {
    textAlign: 'center',
    color: 'white',
    fontFamily: 'NeuePixelSans',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
