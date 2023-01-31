import { MenuView, MenuAction } from '@react-native-menu/menu';
import { StyleProps } from 'react-native-reanimated';
import { useHaptics } from '../../utils/haptics';
import { AnimatedPressable } from './animatedPressable';

type AnimatedMenuViewProps = {
  onPressAction: ({ nativeEvent }) => void;
  actions: MenuAction[];
  title?: string;
  shouldOpenOnLongPress?: boolean;
  children?: JSX.Element | JSX.Element[];
  style?: StyleProps;
};

export const AnimatedMenuView = ({
  onPressAction,
  actions,
  title,
  shouldOpenOnLongPress,
  style,
  children,
}: AnimatedMenuViewProps) => {
  return (
    <MenuView
      onPressAction={onPressAction}
      actions={actions}
      title={title}
      shouldOpenOnLongPress={shouldOpenOnLongPress}
    >
      <AnimatedPressable style={style}>{children}</AnimatedPressable>
    </MenuView>
  );
};
