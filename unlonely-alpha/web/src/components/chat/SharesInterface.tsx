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
      bg={"#1b183f"}
      borderRadius={"10px"}
      border="1px solid #ffffff"
      boxShadow={"0px 0px 10px #ffffff"}
      position="relative"
    >
      <Flex direction="column">
        <Flex position="absolute" left="5px" top="5px">
          <GoPin />
        </Flex>
        <Flex justifyContent="center">
          <Text
            textAlign={"center"}
            width="90%"
            fontSize={"20px"}
            fontWeight={"bold"}
          >
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
        <Flex justifyContent={"center"} gap={"10px"} my="10px">
          <Button
            _hover={{}}
            _focus={{}}
            _active={{}}
            transform={
              selectedSharesOption === "no" ? "scale(0.95)" : undefined
            }
            opacity={selectedSharesOption === "no" ? 0.9 : 1}
            bg={selectedSharesOption === "no" ? "#909090" : "#009d2a"}
            onClick={() => setSelectedSharesOption("yes")}
          >
            <Flex direction="column">
              <Text
                fontFamily="Neue Pixel Sans"
                fontWeight={"light"}
                fontSize="15px"
              >
                YES
              </Text>
              <Text fontWeight={"light"} fontSize="12px">
                (0.001)
              </Text>
            </Flex>
          </Button>
          <Button
            _hover={{}}
            _focus={{}}
            _active={{}}
            transform={
              selectedSharesOption === "yes" ? "scale(0.95)" : undefined
            }
            opacity={selectedSharesOption === "yes" ? 0.9 : 1}
            bg={selectedSharesOption === "yes" ? "#909090" : "#da3b14"}
            onClick={() => setSelectedSharesOption("no")}
          >
            <Flex direction="column">
              <Text
                fontFamily="Neue Pixel Sans"
                fontWeight={"light"}
                fontSize="15px"
              >
                NO
              </Text>
              <Text fontWeight={"light"} fontSize="12px">
                (0.003)
              </Text>
            </Flex>
          </Button>
        </Flex>
        {selectedSharesOption === undefined ? null : (
          <Flex
            direction="column"
            gap="5px"
            bg={"rgba(0, 0, 0, 0.258)"}
            p="0.5rem"
          >
            <Flex justifyContent={"space-between"} zIndex="1">
              <Text fontWeight="light" opacity="0.75">
                enter amount of shares
              </Text>
              <Text fontWeight="light">(your shares: 0.2)</Text>
            </Flex>
            <Flex>
              <Select
                width="60%"
                borderTopRightRadius={"0"}
                borderBottomRightRadius={"0"}
                bg={isBuying ? "#009d2a" : "#da3b14"}
                value={isBuying ? "buy" : "sell"}
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
                placeholder={"0"}
                value={amount}
                onChange={handleInputChange}
              />
              <Button
                _hover={{ bg: "rgba(54, 170, 212, 0.2)" }}
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
            <Button
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg={"#E09025"}
              borderRadius="25px"
            >
              <Text fontSize="20px">confirm {isBuying ? "buy" : "sell"}</Text>
            </Button>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
