import { Flex } from "@chakra-ui/react";

type Prop = {
  clipUrl: string;
};

const ClipDetailCard = ({ clipUrl }: Prop) => {
  return (
    <>
      <Flex
        direction="column"
        w={{ base: "40%", md: "40%", lg: "40%", sm: "100%" }}
        padding="0.3rem"
        borderRadius="1rem"
        minW={{ base: "16rem", sm: "25rem", md: "25rem", lg: "25rem" }}
        justifyContent="center"
      >
        <video controls loop preload="metadata">
          <source src={clipUrl.concat("#t=0.1")} type="video/mp4"></source>
        </video>
      </Flex>
    </>
  );
};

export default ClipDetailCard;
