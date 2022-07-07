import { ModalBody } from "@chakra-ui/react";

export type WalletModalBodyProps = {
  styles?: any;
  children?: React.ReactNode;
};
const WalletModalBodyStyles = {
  textAlign: "center",
  maxW: "200px",
  marginX: "auto",
  paddingX: "0px",
  color: "#9E9E9E",
  fontWeight: "semibold",
  fontSize: "16px",
  fontColor: "white",
  lineHeight: "1.2em",
  paddingY: "10px",
};
const WalletModalBody: React.FunctionComponent<WalletModalBodyProps> = ({
  children,
  styles,
}) => (
  <ModalBody sx={{ ...styles, ...WalletModalBodyStyles }}>{children}</ModalBody>
);

export default WalletModalBody;
