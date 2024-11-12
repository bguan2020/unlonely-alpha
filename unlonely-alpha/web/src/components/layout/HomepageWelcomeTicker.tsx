import Ticker from "react-ticker";
import { Text } from "@chakra-ui/react";
import { useState } from "react";

import PageVisibility from "react-page-visibility";

export const HomepageWelcomeTicker = () => {
  const [pageIsVisible, setPageIsVisible] = useState(true);

  const handleVisibilityChange = (isVisible: boolean) => {
    setPageIsVisible(isVisible);
  };

  return (
    <PageVisibility onChange={handleVisibilityChange}>
      {pageIsVisible && (
        <Ticker speed={10}>
          {() => (
            <Text fontSize="30px" fontWeight="bold" mx="5px">
              gm & welcome 💚 💚 💚
            </Text>
          )}
        </Ticker>
      )}
    </PageVisibility>
  );
};
