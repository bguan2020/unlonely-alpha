import { Box } from "@chakra-ui/react";

export type NFTModalPopupProps = {
  styles?: any;
  children?: React.ReactNode;
};
const NFTModalPopupStyles = {
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
const NFTModalPopup: React.FunctionComponent<NFTModalPopupProps> = ({
  children,
  styles,
}) => <Box sx={{ ...styles, ...NFTModalPopupStyles }}>{children}</Box>;

export default NFTModalPopup;
