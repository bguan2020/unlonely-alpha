import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Spinner } from "@chakra-ui/react";

import useUserAgent from "../../../hooks/internal/useUserAgent";

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
  const { userAgent, isMobile, isStandalone, isIOS } = useUserAgent();

  const closePrompt = () => {
    setDisplayPrompt("");
  };

  useEffect(() => {
    // Only show prompt if user is on mobile and app is not installed
    if (isMobile && !isStandalone) {
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
  }, [userAgent, isMobile, isStandalone, isIOS]);

  const Prompt = () => (
    <>
      {
        {
          safari: <AddToIosSafari closePrompt={closePrompt} />,
          chrome: <AddToMobileChrome closePrompt={closePrompt} />,
          firefox: <AddToMobileFirefox closePrompt={closePrompt} />,
          firefoxIos: <AddToMobileFirefoxIos closePrompt={closePrompt} />,
          chromeIos: <AddToMobileChromeIos closePrompt={closePrompt} />,
          samsung: <AddToSamsung closePrompt={closePrompt} />,
          other: <AddToOtherBrowser closePrompt={closePrompt} />,
          "": <></>,
        }[displayPrompt]
      }
    </>
  );

  return (
    <>
      {displayPrompt !== "" ? (
        <>
          <div
            className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 z-50"
            onClick={closePrompt}
          >
            <Prompt />
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
}
