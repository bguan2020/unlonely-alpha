import { Flex, FlexProps } from "@chakra-ui/react";

export enum BorderType {
  MARBLE,
  OCEAN,
  FIRE,
  GHOST,
}

interface OuterBorderProps extends FlexProps {
  type?: BorderType | string;
  children: React.ReactNode;
}

export const OuterBorder = ({
  type,
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
          p="2px"
          flex={1}
          borderRadius={"15px"}
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
              ? "repeating-linear-gradient(rgba(55, 255, 139, 1) 0%, rgba(81, 187, 254, 1) 100%)"
              : "#e5e5e5"
          }
          p="2px"
          flex={1}
          {...flexProps}
          minWidth={0}
          borderRadius={"15px"}
          boxShadow={
            type === BorderType.OCEAN
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
