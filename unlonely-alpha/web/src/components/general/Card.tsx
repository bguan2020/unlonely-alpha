import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";

const Card: React.FC<BoxProps> = ({ children, ...rest }) => {
  return (
    <Box
      padding="10px 5px 5px 5px"
      mr="5px"
      borderRadius={0}
      borderColor={"black"}
      {...rest}
    >
      {children}
    </Box>
  );
};
export default Card;
