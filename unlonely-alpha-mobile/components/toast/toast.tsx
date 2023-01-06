import { toast as nativeToast, ToastPosition } from '@backpackapp-io/react-native-toast';
import { BlurView } from 'expo-blur';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TOAST_HEIGHT = 40;

export const toast = (message: string) =>
  nativeToast(message, {
    duration: 2000,
    height: TOAST_HEIGHT,
    position: ToastPosition.TOP,
    customToast: t => (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          height: TOAST_HEIGHT,
          width: Dimensions.get('window').width - 32,
          top: 3,
        }}
      >
        <View
          style={{
            // shadow wrapper
            flex: 1,
            flexDirection: 'row',
            borderRadius: 100,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: TOAST_HEIGHT / 3,
            shadowColor: 'black',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.5,
            shadowRadius: 15,
          }}
        >
          <View
            style={[
              {
                // blur wrapper
                flex: 1,
                borderRadius: 100,
                overflow: 'hidden',
              },
              styles.blur,
            ]}
          >
            <BlurView intensity={80} tint="dark" style={styles.blur} />
          </View>
          <Ionicons
            name="ios-checkmark-circle-outline"
            size={TOAST_HEIGHT / 2}
            color="white"
            style={{
              marginRight: TOAST_HEIGHT / 6,
              top: 1,
            }}
          />
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    ),
  });

const styles = StyleSheet.create({
  text: {
    color: 'white',
    fontSize: TOAST_HEIGHT / 3,
    fontFamily: 'NeuePixelSans',
    top: 1,
  },
  blur: {
    position: 'absolute',
    height: TOAST_HEIGHT,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
