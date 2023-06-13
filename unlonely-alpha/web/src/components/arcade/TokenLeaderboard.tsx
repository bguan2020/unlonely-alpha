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

const TokenLeaderboard = ({
  headers,
  dataset,
  ranked,
}: {
  headers: string[];
  dataset: { data: string[]; obscureText?: boolean }[];
  ranked: boolean;
}) => {
  return (
    <Flex
      borderWidth="1px"
      borderRadius={"10px"}
      p="12px"
      bg={
        "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
      }
      height="500px"
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
        who has the most valuable token?
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
                {headers.map((header, i) => (
                  <Th
                    textTransform={"lowercase"}
                    fontSize={"24px"}
                    p="10px"
                    textAlign="center"
                    borderBottom="1px solid #615C5C"
                    key={i}
                  >
                    {header}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {dataset.map((data, i) => (
                <Tr key={i}>
                  {ranked && (
                    <Td fontSize={"24px"} p="10px" textAlign="center">
                      {i + 1}
                    </Td>
                  )}
                  {data.data.map((col, j) => (
                    <Td
                      fontSize={"24px"}
                      p="10px"
                      textAlign="center"
                      key={j}
                      opacity={data.obscureText ? 0.5 : 1}
                    >
                      {col}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Flex>
  );
};
export default TokenLeaderboard;
