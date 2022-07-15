import { IconButton, IconButtonProps } from "@chakra-ui/react";

// An icon button that has a larger clickable area than the space it occupies
const NebulousButton: React.FC<IconButtonProps> = ({ children, ...rest }) => {
  return (
    <IconButton
      _before={{
        content: '""',
        position: "absolute",
        width: "22px",
        height: "22px",
      }}
      variant="ghost"
      colorScheme="blue"
      size="sm"
      height="30px"
      {...rest}
    >
      {children}
    </IconButton>
  );
};
export default NebulousButton;
