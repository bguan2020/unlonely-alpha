import { Flex, Text, IconButton, Image } from "@chakra-ui/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import useUserAgent from "../../hooks/internal/useUserAgent";

export const Tos = () => {
  const { isStandalone } = useUserAgent();

  const [tosPopupCookie, setTosPopupCookie] = useState(null);
  const [tosPopup, setTosPopup] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const value = localStorage.getItem("unlonely-tos-popup");
      setTosPopupCookie(value ? JSON.parse(value) : null);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setTosPopup(true);
    }, 2000);
  }, []);

  return (
    <>
      {tosPopup && !isStandalone && !tosPopupCookie && (
        <Flex
          position="fixed"
          bottom="0"
          bg="black"
          zIndex="20"
          width="100%"
          justifyContent={"center"}
        >
          <Text textAlign={"center"} my="auto">
            By using Unlonely, you agree to our{" "}
            <span
              style={{
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              <Link
                href={"https://www.unlonely.app/privacy"}
                target="_blank"
                passHref
              >
                Privacy Policy
              </Link>
            </span>{" "}
            and{" "}
            <span
              style={{
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              <Link
                href={
                  "https://super-okra-6ad.notion.site/Unlonely-Terms-of-Service-b3c0ea0272c943e98e3120243955cd75"
                }
                target="_blank"
                passHref
              >
                Terms of Service
              </Link>
            </span>
            .
          </Text>
          <IconButton
            aria-label="close"
            _hover={{}}
            _active={{}}
            _focus={{}}
            bg="transparent"
            icon={<Image alt="close" src="/svg/close.svg" width="20px" />}
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.setItem(
                  "unlonely-tos-popup",
                  JSON.stringify(true)
                );
              }
              setTosPopup(false);
            }}
            height="30px"
          />
        </Flex>
      )}
    </>
  );
};
