import { Flex } from "@chakra-ui/layout";

type Prop = {
  clipUrl: string;
};

const ClipDetailCard = ({ clipUrl }: Prop) => {
  return (
    <>
      <Flex
        direction="column"
        w={{ base: "100%", md: "60%", lg: "60%", sm: "100%" }}
        padding="0.3rem"
        borderRadius="1rem"
        minW={{ base: "16rem", sm: "25rem", md: "25rem", lg: "25rem" }}
        mt="8px"
        mr="1rem"
      >
        <video controls loop preload="metadata">
          <source src={clipUrl} type="video/mp4"></source>
        </video>
      </Flex>
    </>
  );
};

export default ClipDetailCard;
