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
        base: "14rem",
        sm: "19rem",
        md: "19rem",
        lg: "19rem",
      }}
      gap={"1rem"}
      pb="1rem"
    >
      {nfcs?.map((h: any) => !!h && <NfcCard key={h.id} nfc={h} />)}
    </Flex>
  );
};

export default NfcList;
