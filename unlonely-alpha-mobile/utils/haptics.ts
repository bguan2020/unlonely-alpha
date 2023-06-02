import * as Haptics from 'expo-haptics';

type HapticsStrength = 'light' | 'medium' | 'heavy';

export function useHaptics(strength: HapticsStrength) {
  if (strength === 'light') {
    return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } else if (strength === 'medium') {
    return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } else if (strength === 'heavy') {
    return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
}
