import { ModalBody } from "@chakra-ui/react";

export type NFTModalBodyProps = {
  styles?: any;
  children?: React.ReactNode;
};
const NFTModalBodyStyles = {
  textAlign: "center",
  maxW: "400px",
  maxHeight: "400px",
  marginX: "auto",
  paddingX: "0px",
  color: "#9E9E9E",
  fontWeight: "semibold",
  fontSize: "16px",
  fontColor: "white",
  lineHeight: "1.2em",
  paddingY: "10px",
  overflowX: "auto",
};
const NFTModalBody: React.FunctionComponent<NFTModalBodyProps> = ({
  children,
  styles,
}) => (
  <ModalBody sx={{ ...styles, ...NFTModalBodyStyles }}>{children}</ModalBody>
);

export default NFTModalBody;
