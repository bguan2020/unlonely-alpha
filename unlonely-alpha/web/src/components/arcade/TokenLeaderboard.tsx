import {
  Flex,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Box,
} from "@chakra-ui/react";

const TokenLeaderboard = () => {
  return (
    <Flex
      borderWidth="1px"
      borderRadius={"10px"}
      p="12px"
      bg={
        "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
      }
      height="100%"
      boxShadow="0px 4px 16px rgba(208, 234, 53, 0.4)"
      background={"#19162F"}
      direction="column"
      width="100%"
    >
      <Text
        fontSize={"44px"}
        fontWeight="400"
        textAlign={"center"}
        fontFamily={"Neue Pixel Sans"}
      >
        channel token leaderboard
      </Text>
      <Text
        color={"#B6B6B6"}
        fontSize={"18"}
        fontWeight="400"
        textAlign={"center"}
      >
        Who has the most valuable token?
      </Text>
      <Box
        borderWidth="1px"
        borderColor="#615C5C"
        borderRadius={10}
        height={["30vh", "100vh"]}
      >
        <TableContainer overflowX={"hidden"}>
          <Table variant="unstyled">
            <Thead>
              <Tr>
                <Th
                  textTransform={"lowercase"}
                  fontSize={"24px"}
                  p="10px"
                  textAlign="center"
                  borderBottom="1px solid #615C5C"
                >
                  rank
                </Th>
                <Th
                  textTransform={"lowercase"}
                  fontSize={"24px"}
                  p="10px"
                  textAlign="center"
                  borderBottom="1px solid #615C5C"
                >
                  token
                </Th>
                <Th
                  textTransform={"lowercase"}
                  fontSize={"24px"}
                  p="10px"
                  textAlign="center"
                  borderBottom="1px solid #615C5C"
                  isNumeric
                >
                  price (ETH)
                </Th>
                <Th
                  textTransform={"lowercase"}
                  fontSize={"24px"}
                  p="10px"
                  textAlign="center"
                  borderBottom="1px solid #615C5C"
                  isNumeric
                >
                  # hodlers
                </Th>
                <Th
                  textTransform={"lowercase"}
                  fontSize={"24px"}
                  p="10px"
                  textAlign="center"
                  borderBottom="1px solid #615C5C"
                  isNumeric
                >
                  channel owner
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td fontSize={"24px"} p="10px" textAlign="center">
                  1
                </Td>
                <Td fontSize={"24px"} p="10px" textAlign="center">
                  cruzy
                </Td>
                <Td fontSize={"24px"} p="10px" textAlign="center" isNumeric>
                  25000
                </Td>
                <Td fontSize={"24px"} p="10px" textAlign="center" isNumeric>
                  25000
                </Td>
                <Td fontSize={"24px"} p="10px" textAlign="center" isNumeric>
                  25000
                </Td>
              </Tr>
              <Tr>
                <Td fontSize={"24px"} p="10px" textAlign="center">
                  2
                </Td>
                <Td fontSize={"24px"} p="10px" textAlign="center">
                  tiny
                </Td>
                <Td fontSize={"24px"} p="10px" textAlign="center" isNumeric>
                  3000
                </Td>
                <Td fontSize={"24px"} p="10px" textAlign="center" isNumeric>
                  25000
                </Td>
                <Td fontSize={"24px"} p="10px" textAlign="center" isNumeric>
                  25000
                </Td>
              </Tr>
              <Tr>
                <Td fontSize={"24px"} p="10px" textAlign="center">
                  3
                </Td>
                <Td fontSize={"24px"} p="10px" textAlign="center">
                  me
                </Td>
                <Td fontSize={"24px"} p="10px" textAlign="center" isNumeric>
                  10
                </Td>
                <Td fontSize={"24px"} p="10px" textAlign="center" isNumeric>
                  25000
                </Td>
                <Td fontSize={"24px"} p="10px" textAlign="center" isNumeric>
                  25000
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Flex>
  );
};
export default TokenLeaderboard;
