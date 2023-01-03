import { Box, Flex, Text, Stack, Image } from "@chakra-ui/react";
import Link from "next/link";

import usePostStreamInteraction from "../../hooks/usePostStreamInteraction";
import { CustomToast } from "../general/CustomToast";
import TransactionModal from "../transactions/transactionModal";

const BrianTokenTab: React.FunctionComponent<any> = () => {
  const { postStreamInteraction, loading: postChatLoading } =
    usePostStreamInteraction({});
  const { addToast } = CustomToast();
  return (
    <Flex direction="column">
      <Flex justify="space-between">
        <Text color="black" fontSize="xl" mt={2} align="center">
          Set a random scene.
        </Text>

        <TransactionModal
          price={100}
          title="Randomize Scene"
          onSuccess={async (hash) => {
            try {
              addToast({
                render: (
                  <Box
                    as="button"
                    borderRadius="md"
                    bg="green"
                    px={4}
                    h={8}
                    color="white"
                  >
                    <Link
                      target="_blank"
                      href={`https://polygonscan.com/tx/${hash}`}
                      passHref
                    >
                      <a target="_blank">Transaction approved, click to view</a>
                    </Link>
                  </Box>
                ),
              });
              await postStreamInteraction({ interactionType: "scene-change" });
            } catch (e) {}
          }}
        />
      </Flex>
      <Stack mb={2} justify="start" direction="row" spacing={5}>
        <Image
          width={250}
          height={125}
          alt="Unlonely one"
          src="/images/unlonelyone.jpg"
        />
        <Image
          width={250}
          height={125}
          alt="Unlonely one"
          src="/images/unlonely2.jpg"
        />
        <Image
          width={250}
          height={125}
          alt="Unlonely one"
          src="/images/unlonely3.jpg"
        />
      </Stack>
      <Text color="black" fontSize="lg" align="center">
        ... and many more!
      </Text>
    </Flex>
  );
};

export default BrianTokenTab;
