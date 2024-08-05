import { Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { useRef, useEffect, useState } from "react";

import NfcCard from "./NfcCard";
import NfcCardSkeleton from "./NfcCardSkeleton";

type Props = {
  nfcs: any[];
  makeLinksExternal?: boolean;
  nextButton?: {
    label: string;
    onClick: () => Promise<void>;
  };
  loading?: boolean;
};

const NfcList: React.FunctionComponent<Props> = ({
  nfcs,
  makeLinksExternal,
  nextButton,
  loading,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [showNextButton, setShowNextButton] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleScroll = () => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 100) {
        setShowNextButton(true);
      } else {
        setShowNextButton(false);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 100) {
        setShowNextButton(true);
      } else {
        setShowNextButton(false);
      }
    };

    el.addEventListener("wheel", handleWheel);
    el.addEventListener("scroll", handleScroll);

    return () => {
      el.removeEventListener("wheel", handleScroll);
      el.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Flex
      ref={ref}
      direction="row"
      overflowX="scroll"
      overflowY="clip"
      width="100%"
      height={{
        base: "15rem",
        sm: "20rem",
        md: "20rem",
        lg: "20rem",
      }}
      gap={"1rem"}
      py="1rem"
      position={"relative"}
    >
      {nfcs?.map(
        (h: any) =>
          !!h && (
            <NfcCard key={h.id} nfc={h} makeLinksExternal={makeLinksExternal} />
          )
      )}
      {loading && [1, 2, 3, 4, 5].map((i) => <NfcCardSkeleton key={i} />)}
      {nextButton && (
        <Button
          opacity={showNextButton ? 1 : 0}
          transition={"all 0.3s"}
          right={showNextButton ? "50px" : 0}
          position="fixed"
          onClick={async () => {
            await nextButton?.onClick().then(() => {
              setShowNextButton(false);
            });
          }}
          bg={"rgba(55, 255, 139, 1)"}
        >
          <Text>{loading ? <Spinner /> : nextButton?.label}</Text>
        </Button>
      )}
    </Flex>
  );
};

export default NfcList;
