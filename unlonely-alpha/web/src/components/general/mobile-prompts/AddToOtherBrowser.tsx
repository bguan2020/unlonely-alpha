import React from "react";
import { Button, Link, Text } from "@chakra-ui/react";

import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";

interface Props {
  closePrompt: () => void;
}

export default function AddToOtherBrowser(props: Props) {
  const { closePrompt } = props;
  const searchUrl =
    "https://www.google.com/search?q=add+to+home+screen+for+common-mobile-browsers";

  return (
    <TransactionModalTemplate
      isModalLoading={false}
      isOpen={true}
      handleClose={closePrompt}
      hideFooter={true}
    >
      <Text>
        For the best experience, we recommend adding the Unlonely app to your
        home screen!
      </Text>
      <Text>
        Unfortunately, we were unable to determine which browser you are using.
        Please search for how to install a web app for your browser.
      </Text>
      <Link className="text-blue-300" href={searchUrl} target="_blank">
        Try This Search
      </Link>
      <Button
        bg="#4a5c45"
        _hover={{}}
        _focus={{}}
        _active={{}}
        onClick={closePrompt}
        width="100%"
        borderRadius="25px"
      >
        close
      </Button>
    </TransactionModalTemplate>
  );
}
