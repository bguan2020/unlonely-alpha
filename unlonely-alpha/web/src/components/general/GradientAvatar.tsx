import { Box } from "@chakra-ui/layout";

const GradientAvatar: React.FC<{ size?: number | string; color?: string }> = ({
  size = 15,
  color = "#580030",
}) => {
  return (
    <Box
      width={size}
      height={size}
      background={color}
      //boxShadow="inset 0px -6px 12px rgba(255, 255, 255, 0.5)"
      borderRadius="full"
      borderColor={color}
    />
  );
};
export default GradientAvatar;
