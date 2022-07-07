import { Box } from "@chakra-ui/react";

export type WalletModalPopupProps = {
  styles?: any;
  children?: React.ReactNode;
};
const WalletModalPopupStyles = {
  position: "absolute",
  bottom: "-78px",
  fontSize: "20px",
  fontWeight: "semibold",
  height: "48px",
  lineHeight: "48px",
  paddingX: "40px",
  background: "#3A3A3A",
  borderRadius: "12px",
  borderColor: "#202020",
  color: "#9E9E9E",
  borderStyle: "solid",
  borderWidth: "1px",
};
const WalletModalPopup: React.FunctionComponent<WalletModalPopupProps> = ({
  children,
  styles,
}) => <Box sx={{ ...styles, ...WalletModalPopupStyles }}>{children}</Box>;

export default WalletModalPopup;
