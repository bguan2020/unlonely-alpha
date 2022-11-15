import NfcCard from "./NfcCard";

type Props = {
  nfcs: any[];
};

const NfcList: React.FunctionComponent<Props> = ({ nfcs }) => {
  return <>{nfcs?.map((h: any) => !!h && <NfcCard key={h.id} nfc={h} />)}</>;
};

export default NfcList;
