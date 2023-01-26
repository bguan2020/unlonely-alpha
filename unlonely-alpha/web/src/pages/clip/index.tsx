import { Flex, Text, Progress } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import AppLayout from "../../components/layout/AppLayout";
import useCreateClip from "../../hooks/useCreateClip";
import ClipDetailCard from "../../components/NFCs/ClipDetailCard";

const ClipDetail = () => {
  const [progressBar, setProgressBar] = useState<number>(8);
  const [clipUrl, setClipUrl] = useState<null | any>(null);
  const [formError, setFormError] = useState<null | string[]>(null);
  const { createClip } = useCreateClip({
    onError: (m) => {
      setFormError(m ? m.map((e) => e.message) : ["An unknown error occurred"]);
    },
  });

  // useeffect to call createClip
  useEffect(() => {
    const fetchData = async () => {
      const { res } = await createClip();
      setClipUrl(res);
    };
    fetchData();
  }, []);

  // update progress bar every 5 seconds, adding 8 to progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      if (progressBar > 85) {
        clearInterval(interval);
        return;
      }
      setProgressBar((prev) => prev + 8);
    }, 5000);
  }, []);

  return (
    <>
      <AppLayout isCustomHeader={false}>
        <Flex justifyContent="center" mt="5rem" direction="column">
          {!clipUrl ? (
            <Flex width="100%" justifyContent="center">
              <Flex direction="column" width="60%">
                <Progress size="md" value={progressBar} hasStripe isAnimated />
                {progressBar <= 20 && (
                  <Text fontSize="16px">generating clip...</Text>
                )}
                {progressBar <= 40 && progressBar > 20 && (
                  <Text fontSize="16px">contacting AWS...</Text>
                )}
                {progressBar <= 60 && progressBar > 40 && (
                  <Text fontSize="16px">praying to Bezos...</Text>
                )}
                {progressBar <= 80 && progressBar > 60 && (
                  <Text fontSize="16px">almost done...</Text>
                )}
                {progressBar <= 100 && progressBar > 80 && (
                  <Text fontSize="16px">finalizing clip...</Text>
                )}
              </Flex>
            </Flex>
          ) : (
            <Flex width="100%" justifyContent="center">
              <ClipDetailCard clipUrl={clipUrl} />
            </Flex>
          )}
          <Flex width="100%" justifyContent="center" mt="2rem">
            <Flex width="100%" justifyContent="center" direction="column">
              {!clipUrl ? (
                <Flex width="100%" justifyContent="center">
                  <Text fontSize="16px">
                    Be patient! Clip is being generated!
                  </Text>
                </Flex>
              ) : (
                <Flex width="100%" justifyContent="center">
                  <Text fontSize="16px">
                    Clip generated! Title your clip and mint it!
                  </Text>
                </Flex>
              )}
            </Flex>
          </Flex>
        </Flex>
      </AppLayout>
    </>
  );
};

export default ClipDetail;
