import { MotiPressable } from 'moti/interactions';
import { runOnJS, StyleProps } from 'react-native-reanimated';
import { useHaptics } from '../../utils/haptics';

type AnimatedPressableProps = {
  onPress?: () => void;
  children?: JSX.Element | JSX.Element[];
  style?: StyleProps;
  bouncy?: boolean;
};

export const AnimatedPressable = ({ onPress, style, children, bouncy }: AnimatedPressableProps) => {
  return (
    <MotiPressable
      onPress={onPress}
      animate={({ pressed }) => {
        'worklet';
        if (pressed) runOnJS(useHaptics)('light');
        return {
          scale: pressed ? (bouncy ? 0.75 : 0.85) : 1,
        };
      }}
      transition={
        bouncy
          ? {
              type: 'spring',
              stiffness: 400,
              mass: 0.5,
              damping: 8,
            }
          : {
              type: 'timing',
              duration: 150,
            }
      }
      style={style}
    >
      {children}
    </MotiPressable>
  );
};
