import {
  Box,
  Flex,
  IconButton,
  Button,
  Select,
  Input,
  Text,
  Image,
} from "@chakra-ui/react";
import { useState } from "react";
import { GoPin } from "react-icons/go";

import { filteredInput } from "../../utils/validation/input";

export const SharesInterface = () => {
  const [selectedSharesOption, setSelectedSharesOption] = useState<
    string | undefined
  >(undefined);
  const [isBuying, setIsBuying] = useState<boolean>(true);
  const [amount, setAmount] = useState("");

  const handleInputChange = (event: any) => {
    const input = event.target.value;
    const filtered = filteredInput(input);
    setAmount(filtered);
  };

  return (
    <Box
      mt="10px"
      transition="all 0.5s ease"
      bg={"#282461"}
      borderRadius={"10px"}
      border="1px solid #ffffff"
      boxShadow={"0px 0px 10px #ffffff"}
      position="relative"
    >
      <Box
        borderRadius={"10px"}
        position="absolute"
        w="100%"
        height="100%"
        bgGradient="linear(to-t, #006400, transparent 100%)"
        opacity={selectedSharesOption === "yes" ? 1 : 0}
        transition="opacity 0.3s"
        pointerEvents={"none"}
      />
      <Box
        borderRadius={"10px"}
        position="absolute"
        w="100%"
        height="100%"
        bgGradient="linear(to-t, #aa1902, transparent 100%)"
        opacity={selectedSharesOption === "no" ? 1 : 0}
        transition="opacity 0.3s"
        pointerEvents={"none"}
      />
      <Flex direction="column" p="0.5rem">
        <Flex
          position="absolute"
          left="5px"
          top="5px"
          className="zooming-text-2"
        >
          <GoPin />
        </Flex>
        <Flex justifyContent="center">
          <Text textAlign={"center"} width="90%">
            there is gonna be a question over here
          </Text>
        </Flex>
        {selectedSharesOption !== undefined && (
          <IconButton
            aria-label="close"
            _hover={{}}
            _active={{}}
            _focus={{}}
            bg="transparent"
            icon={<Image alt="close" src="/svg/close.svg" width="15px" />}
            onClick={() => {
              setSelectedSharesOption(undefined);
            }}
            position="absolute"
            right="-5px"
            top="-5px"
          />
        )}
        <Flex justifyContent={"center"} gap={"10px"}>
          <Button
            _hover={{ bg: "#7ce603" }}
            _focus={{}}
            _active={{}}
            transform={
              selectedSharesOption === "no" ? "scale(0.95)" : undefined
            }
            opacity={selectedSharesOption === "no" ? 0.3 : 1}
            bg="#75d606"
            onClick={() => setSelectedSharesOption("yes")}
          >
            <Flex direction="column">
              <Text fontFamily="Neue Pixel Sans" fontWeight={"light"}>
                YES
              </Text>
              <Text fontWeight={"light"} fontSize="14px">
                (0.001)
              </Text>
            </Flex>
          </Button>
          <Button
            _hover={{
              bg: "#e75309",
            }}
            _focus={{}}
            _active={{}}
            transform={
              selectedSharesOption === "yes" ? "scale(0.95)" : undefined
            }
            bg="#da3b14"
            opacity={selectedSharesOption === "yes" ? 0.25 : 1}
            onClick={() => setSelectedSharesOption("no")}
          >
            <Flex direction="column">
              <Text fontFamily="Neue Pixel Sans" fontWeight={"light"}>
                NO
              </Text>
              <Text fontWeight={"light"} fontSize="14px">
                (0.003)
              </Text>
            </Flex>
          </Button>
        </Flex>
        {selectedSharesOption === undefined ? null : (
          <Flex direction="column" mt="10px" gap="5px">
            <Flex justifyContent={"space-between"} zIndex="1">
              <Text fontWeight="light">amount</Text>
              <Text fontWeight="light">(your shares: 0.2)</Text>
            </Flex>
            <Flex>
              <Select
                width="60%"
                borderTopRightRadius={"0"}
                borderBottomRightRadius={"0"}
                bg={isBuying ? "#75d606" : "#ec6a00"}
                onChange={(e) => {
                  const buyState = e.target.value === "buy";
                  setIsBuying(buyState);
                }}
              >
                <option value="buy" style={{ background: "#504b8d" }}>
                  <Text>buy</Text>
                </option>
                <option value="sell" style={{ background: "#504b8d" }}>
                  <Text>sell</Text>
                </option>
              </Select>
              <Input
                borderTopLeftRadius={"0"}
                borderBottomLeftRadius={"0"}
                borderTopRightRadius={"0"}
                borderBottomRightRadius={"0"}
                variant="glow"
                boxShadow={"unset"}
                placeholder={"enter amount of shares"}
                value={amount}
                onChange={handleInputChange}
              />
              <Button
                _hover={{ bg: "rgba(54, 170, 212, 1)" }}
                _focus={{}}
                _active={{}}
                borderTopLeftRadius={"0"}
                borderBottomLeftRadius={"0"}
                bg="transparent"
                border="1px solid #3097bd"
                boxShadow={"inset 0px 0px 5px #2f92b6"}
              >
                <Text fontWeight="light">MAX</Text>
              </Button>
            </Flex>
            <Flex justifyContent={"space-between"} zIndex="1">
              <Text opacity="0.75" fontWeight="light">
                price
              </Text>
              <Text fontWeight="light">0.001 ETH</Text>
            </Flex>
            <Button _hover={{}} _focus={{}} _active={{}} bg={"#00bbff"} py={6}>
              <Text fontSize="23px">confirm {isBuying ? "buy" : "sell"}</Text>
            </Button>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
