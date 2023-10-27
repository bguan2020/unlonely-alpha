import { Flex, FlexProps } from "@chakra-ui/react";

export enum BorderType {
  MARBLE,
  OCEAN,
  FIRE,
  GHOST,
}

interface OuterBorderProps extends FlexProps {
  type?: BorderType | string;
  noborder?: boolean;
  children: React.ReactNode;
}

export const OuterBorder = ({
  type,
  noborder,
  children,
  ...flexProps
}: OuterBorderProps) => {
  return (
    <>
      {type === BorderType.MARBLE ||
      type === undefined ||
      typeof type === "string" ? (
        <Flex
          bg={typeof type === "string" ? type : "white"}
          p="1px"
          flex={1}
          minWidth={0}
          {...flexProps}
        >
          {children}
        </Flex>
      ) : (
        <Flex
          bg={
            type === BorderType.OCEAN
              ? "repeating-linear-gradient(rgba(55, 255, 139, 1) 0%, rgba(81, 187, 254, 1) 100%)"
              : type === BorderType.FIRE
              ? "repeating-linear-gradient(rgba(255, 6, 6, 1) 0%, rgba(237, 174, 73, 1) 100%)"
              : "#e5e5e5"
          }
          p="1px"
          flex={1}
          {...flexProps}
          minWidth={0}
          boxShadow={
            noborder
              ? "none"
              : type === BorderType.OCEAN
              ? "0px 0px 16px rgba(25, 242, 246, 0.4)"
              : type === BorderType.FIRE
              ? "0px 0px 16px rgba(246, 206, 25, 0.4)"
              : "0px 0px 16px rgba(211, 211, 211, 0.4)"
          }
        >
          {children}
        </Flex>
      )}
    </>
  );
};
