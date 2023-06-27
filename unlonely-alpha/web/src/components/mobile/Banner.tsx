import { Box, Text, Link } from "@chakra-ui/react";

const isMobile = () => {
  if (typeof window !== "undefined") {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }
  return false;
};

const MobileBanner = () => {
  const isMobileDevice = isMobile();
  const downloadLink = isIosDevice()
    ? "https://dub.sh/unlonely-iphone"
    : "https://dub.sh/unlonely-android";
  const deviceType = isIosDevice() ? "iPhone" : "Android";

  // make Participant overlap each other a bit and show a max of 6, with the last one being a count of the rest
  return (
    <>
      {isMobileDevice && (
        <Box bg="black" width="100%" textAlign="center" color="white">
          <Text fontWeight="bold" pt="1rem" pb="0.8rem" fontSize="1.2rem">
            Download our {deviceType} app for the best experience!
            <Link href={downloadLink} ml={2} color="blue.300">
              Click here.
            </Link>
          </Text>
        </Box>
      )}
    </>
  );
};

export function isIosDevice() {
  if (typeof window !== "undefined") {
    return (
      navigator.userAgent.match(/iPhone|iPod/i) ||
      (navigator.userAgent.match(/iPad/i) &&
        navigator.userAgent.match(/WebKit/i))
    );
  }
  return false;
}

export default MobileBanner;
