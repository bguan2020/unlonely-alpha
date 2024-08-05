import { Text } from "@chakra-ui/react";

export const WavyText = ({
  text,
  modifier = 0.1,
}: {
  text: string;
  modifier?: number;
  noSplit?: boolean;
}) => {
  return (
    <>
      {text.split("").map((letter, index) => (
        <Text
          className="bouncing-text"
          key={index}
          fontFamily="LoRes15"
          style={{
            animationDelay: `${index * modifier}s`,
          }}
        >
          {letter}
        </Text>
      ))}
    </>
  );
};
