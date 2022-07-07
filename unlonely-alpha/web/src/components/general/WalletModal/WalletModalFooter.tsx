import { ModalFooter } from "@chakra-ui/react";

export type WalletModalFooterProps = {
  styles?: any;
  children?: React.ReactNode;
};
const WalletModalFooterStyles = {
  display: "flex",
  flexDirection: "row",
  gap: "10px",
  padding: "0px",
};
const WalletModalFooter: React.FunctionComponent<WalletModalFooterProps> = ({
  children,
  styles,
}) => (
  <ModalFooter sx={{ ...styles, ...WalletModalFooterStyles }}>
    {children}
  </ModalFooter>
);

export default WalletModalFooter;
