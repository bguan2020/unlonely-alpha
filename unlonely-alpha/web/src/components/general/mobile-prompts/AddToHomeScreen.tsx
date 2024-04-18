import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Spinner } from "@chakra-ui/react";

import useUserAgent from "../../../hooks/internal/useUserAgent";
import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";

const AddToIosSafari = dynamic(() => import("./AddToIosSafari"), {
  loading: () => <Spinner size="xl" />,
});
const AddToMobileChrome = dynamic(() => import("./AddToMobileChrome"), {
  loading: () => <Spinner size="xl" />,
});
const AddToMobileFirefox = dynamic(() => import("./AddToMobileFirefox"), {
  loading: () => <Spinner size="xl" />,
});
const AddToMobileFirefoxIos = dynamic(() => import("./AddToMobileFirefoxIos"), {
  loading: () => <Spinner size="xl" />,
});
const AddToMobileChromeIos = dynamic(() => import("./AddToMobileChromeIos"), {
  loading: () => <Spinner size="xl" />,
});
const AddToSamsung = dynamic(() => import("./AddToSamsung"), {
  loading: () => <Spinner size="xl" />,
});
const AddToOtherBrowser = dynamic(() => import("./AddToOtherBrowser"), {
  loading: () => <Spinner size="xl" />,
});

type AddToHomeScreenPromptType =
  | "safari"
  | "chrome"
  | "firefox"
  | "other"
  | "firefoxIos"
  | "chromeIos"
  | "samsung"
  | "";

export default function AddToHomeScreen() {
  const [displayPrompt, setDisplayPrompt] =
    useState<AddToHomeScreenPromptType>("");
  const { userAgent, isMobile } = useUserAgent();

  const closePrompt = () => {
    setDisplayPrompt("");
  };

  useEffect(() => {
    // Only show prompt if user is on mobile and app is not installed
    if (isMobile) {
      if (userAgent === "Safari") {
        setDisplayPrompt("safari");
      } else if (userAgent === "Chrome") {
        setDisplayPrompt("chrome");
      } else if (userAgent === "Firefox") {
        setDisplayPrompt("firefox");
      } else if (userAgent === "FirefoxiOS") {
        setDisplayPrompt("firefoxIos");
      } else if (userAgent === "ChromeiOS") {
        setDisplayPrompt("chromeIos");
      } else if (userAgent === "SamsungBrowser") {
        setDisplayPrompt("samsung");
      } else {
        setDisplayPrompt("other");
      }
    }
  }, [userAgent, isMobile]);

  return (
    <TransactionModalTemplate
      size="xs"
      isModalLoading={false}
      isOpen={displayPrompt !== ""}
      handleClose={closePrompt}
      hideFooter
      blur
      bg="#e7e7e7"
    >
      {displayPrompt === "safari" && (
        <AddToIosSafari closePrompt={closePrompt} />
      )}
      {displayPrompt === "chrome" && (
        <AddToMobileChrome closePrompt={closePrompt} />
      )}
      {displayPrompt === "firefox" && (
        <AddToMobileFirefox closePrompt={closePrompt} />
      )}
      {displayPrompt === "firefoxIos" && (
        <AddToMobileFirefoxIos closePrompt={closePrompt} />
      )}
      {displayPrompt === "chromeIos" && (
        <AddToMobileChromeIos closePrompt={closePrompt} />
      )}
      {displayPrompt === "samsung" && (
        <AddToSamsung closePrompt={closePrompt} />
      )}
      {displayPrompt === "other" && (
        <AddToOtherBrowser closePrompt={closePrompt} />
      )}
    </TransactionModalTemplate>
  );
}
