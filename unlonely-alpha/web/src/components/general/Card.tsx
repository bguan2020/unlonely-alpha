import { Box, BoxProps } from "@chakra-ui/layout";
import React from "react";

const Card: React.FC<BoxProps> = ({ children, ...rest }) => {
  return (
    <Box
      padding="10px 5px 5px 5px"
      mb="10px"
      mr="5px"
      bg="#F1F4F8"
      borderRadius={0}
      borderColor={"black"}
      {...rest}
    >
      {children}
    </Box>
  );
};
export default Card;
