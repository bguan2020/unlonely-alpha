import { Flex } from "@chakra-ui/react";
import NfcCard from "./NfcCard";

type Props = {
  nfcs: any[];
};

const NfcList: React.FunctionComponent<Props> = ({ nfcs }) => {
  return (
    <Flex
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
    >
      {nfcs?.map((h: any) => !!h && <NfcCard key={h.id} nfc={h} />)}
    </Flex>
  );
};

export default NfcList;
