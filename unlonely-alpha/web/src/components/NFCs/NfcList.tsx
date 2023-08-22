import { Flex } from "@chakra-ui/react";
import { useRef, useEffect } from "react";

import NfcCard from "./NfcCard";

type Props = {
  nfcs: any[];
};

const NfcList: React.FunctionComponent<Props> = ({ nfcs }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", handleWheel);
    return () => el.removeEventListener("wheel", handleWheel);
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
    >
      {nfcs?.map((h: any) => !!h && <NfcCard key={h.id} nfc={h} />)}
    </Flex>
  );
};

export default NfcList;
