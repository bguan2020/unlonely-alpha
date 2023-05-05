import { toast as nativeToast, ToastPosition } from '@backpackapp-io/react-native-toast';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurLayer } from '../blur/blurLayer';

const TOAST_HEIGHT = 40;

export const toast = (message: string, variant?: string) =>
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
          width: Dimensions.get('window').width - 96 - 32,
          left: 48,
          top: 3,
          position: 'absolute',
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
            backgroundColor: variant === 'error' ? '#ff4d4d' : 'black',
          }}
        >
          <View
            style={[
              {
                // blur wrapper
                flex: 1,
                borderRadius: 100,
                overflow: 'hidden',
                height: TOAST_HEIGHT,
              },
              StyleSheet.absoluteFillObject,
            ]}
          >
            <BlurLayer
              blurAmount={30}
              blurType="dark"
              style={[
                StyleSheet.absoluteFillObject,
                {
                  height: TOAST_HEIGHT,
                },
              ]}
            />
          </View>
          <Ionicons
            name={variant === 'error' ? 'ios-close-circle-outline' : 'ios-checkmark-circle-outline'}
            size={TOAST_HEIGHT / 2}
            color={variant === 'error' ? '#ff4d4d' : '#e2f979'}
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
});
