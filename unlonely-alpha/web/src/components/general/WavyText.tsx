import { Text } from "@chakra-ui/react";

export const WavyText = ({ text }: { text: string }) => {
  return (
    <>
      {text.split("").map((letter, index) => (
        <Text
          className="bouncing-text"
          key={index}
          fontFamily="LoRes15"
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        >
          {letter}
        </Text>
      ))}
    </>
  );
};
