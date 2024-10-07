import { Flex } from "@chakra-ui/react";

export const BooEventTile = ({
  children,
  color,
  width,
  height,
  backgroundColor,
}: {
  children: React.ReactNode;
  color: string;
  width?: string;
  height?: string;
  backgroundColor?: string;
}) => {
  return (
    <Flex position={"relative"} width={width} height={height}>
      <Flex
        position={"absolute"}
        top={0}
        left={0}
        width={"calc(100% - 5px)"}
        height={"calc(100% - 5px)"}
        bg={color}
      ></Flex>
      <Flex
        position={"absolute"}
        bottom={0}
        right={0}
        width={"calc(100% - 5px)"}
        height={"calc(100% - 5px)"}
        bg={backgroundColor ?? "#161923"}
        border={`4px solid ${color}`}
        direction={"column"}
      >
        {children}
      </Flex>
    </Flex>
  );
};
