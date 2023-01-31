import { View, Text, Pressable, StyleSheet } from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

export const VoteControls = () => {
  const upvote = () => {
    console.log('upvote');
  };

  const downvote = () => {
    console.log('downvote');
  };

  return (
    <View style={styles.votingControls}>
      <Pressable
        onPress={upvote}
        style={({ pressed }) => [
          {
            transform: pressed ? [{ scale: 0.96 }] : [{ scale: 1 }],
          },
          styles.votingButton,
        ]}
      >
        <AntDesign name="arrowup" size={16} color="white" />
      </Pressable>
      <Text style={styles.votingControlsText}>12</Text>
      <Pressable>
        <AntDesign name="arrowdown" size={16} color="white" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  votingControls: {
    flexDirection: 'row',
  },
  votingControlsText: {
    color: 'white',
  },
  votingButton: {},
});
