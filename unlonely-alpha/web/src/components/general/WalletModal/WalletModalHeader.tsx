import { ModalHeader } from "@chakra-ui/react";

export type WalletModalHeaderProps = {
  styles?: any;
  children?: React.ReactNode;
};
const WalletModalHeaderStyles = {
  textAlign: "center",
  color: "#9E9E9E",
  fontSize: "28px",
  lineHeight: "32px",
  marginBottom: "10px",
  padding: "0px",
  fontWeight: "bold",
  justifyContent: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};
const WalletModalHeader: React.FunctionComponent<WalletModalHeaderProps> = ({
  children,
  styles,
}) => (
  <ModalHeader sx={{ ...styles, ...WalletModalHeaderStyles }}>
    <>{children}</>
  </ModalHeader>
);

export default WalletModalHeader;
