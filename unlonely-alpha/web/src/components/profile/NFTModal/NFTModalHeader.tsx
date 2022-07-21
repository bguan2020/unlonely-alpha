import { ModalHeader } from "@chakra-ui/react";

export type NFTModalHeaderProps = {
  styles?: any;
  children?: React.ReactNode;
};
const NFTModalHeaderStyles = {
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
const NFTModalHeader: React.FunctionComponent<NFTModalHeaderProps> = ({
  children,
  styles,
}) => (
  <ModalHeader sx={{ ...styles, ...NFTModalHeaderStyles }}>
    <>{children}</>
  </ModalHeader>
);

export default NFTModalHeader;
