import { ModalFooter } from "@chakra-ui/react";

export type NFTModalFooterProps = {
  styles?: any;
  children?: React.ReactNode;
};
const NFTModalFooterStyles = {
  display: "flex",
  flexDirection: "row",
  gap: "10px",
  padding: "0px",
};
const NFTModalFooter: React.FunctionComponent<NFTModalFooterProps> = ({
  children,
  styles,
}) => (
  <ModalFooter sx={{ ...styles, ...NFTModalFooterStyles }}>
    {children}
  </ModalFooter>
);

export default NFTModalFooter;
