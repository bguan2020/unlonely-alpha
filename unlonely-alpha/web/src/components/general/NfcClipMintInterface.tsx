import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Flex, Button, Input, Link, Text } from "@chakra-ui/react";
import { ETH_COST_FOR_ONE_NFT_MINT } from "../../constants";
import {
  filteredInput,
  formatIncompleteNumber,
} from "../../utils/validation/input";
import { useState } from "react";
import { useUser } from "../../hooks/context/useUser";

export const NfcClipMintInterface = ({
  mintCallback,
  contract1155Address,
  tokenId,
  zoraLink,
}: {
  mintCallback: (
    contract1155Address: string,
    tokenId: number,
    quantityToMint: bigint
  ) => Promise<void>;
  contract1155Address: string;
  tokenId: number;
  zoraLink?: string;
}) => {
  const { user, walletIsConnected } = useUser();

  const [selectedTokensToMint, setSelectedTokensToMint] = useState<string>("1");
  const [customAmountSelected, setCustomAmountSelected] = useState(false);
  const [customTokensToMint, setCustomTokensToMint] = useState<string>("");

  return (
    <Flex
      direction="column"
      bg="rgba(0,0,0,0.5)"
      p="5px"
      borderRadius={"15px"}
      position={"relative"}
    >
      {(!user || !walletIsConnected) && (
        <Flex
          position="absolute"
          bg="rgba(0,0,0,0.75)"
          width="100%"
          h="100%"
          top="0"
          left="0"
          bottom="0"
          right="0"
          justifyContent="center"
          alignItems="center"
          margin="auto"
          zIndex={1}
        >
          <Text fontFamily="LoRes15">You must connect your wallet to mint</Text>
        </Flex>
      )}
      <Flex gap="20px">
        {zoraLink && (
          <Link href={zoraLink} isExternal>
            <Text
              as="span"
              color="#15dae4"
              fontSize={"12px"}
              wordBreak="break-word"
              textAlign="left"
            >
              zora link
              <ExternalLinkIcon mx="2px" />
            </Text>
          </Link>
        )}
      </Flex>
      <Flex gap="10px" alignItems={"center"}>
        <Button
          color="rgba(63, 59, 253, 1)"
          height="20px"
          width="20px"
          _hover={{}}
          bg={selectedTokensToMint === "1" ? "rgba(55, 255, 139, 1)" : "white"}
          onClick={() => {
            setCustomAmountSelected(false);
            setSelectedTokensToMint("1");
          }}
        >
          1
        </Button>
        <Button
          color="rgba(63, 59, 253, 1)"
          height="20px"
          width="20px"
          _hover={{}}
          bg={selectedTokensToMint === "3" ? "rgba(55, 255, 139, 1)" : "white"}
          onClick={() => {
            setCustomAmountSelected(false);
            setSelectedTokensToMint("3");
          }}
        >
          3
        </Button>
        <Button
          color="rgba(63, 59, 253, 1)"
          height="20px"
          width="20px"
          _hover={{}}
          bg={selectedTokensToMint === "10" ? "rgba(55, 255, 139, 1)" : "white"}
          onClick={() => {
            setCustomAmountSelected(false);
            setSelectedTokensToMint("10");
          }}
        >
          10
        </Button>
        <Button
          color="rgba(63, 59, 253, 1)"
          height="20px"
          width="70px"
          p="0"
          _hover={{}}
          bg={customAmountSelected ? "rgba(55, 255, 139, 1)" : "white"}
          onClick={() => {
            setCustomAmountSelected(true);
            setSelectedTokensToMint(customTokensToMint);
          }}
          position={"relative"}
        >
          custom
          <Input
            cursor="pointer"
            position="absolute"
            bottom={customAmountSelected ? "-25px" : "0px"}
            opacity={customAmountSelected ? 1 : 0}
            transition={"all 0.3s"}
            bg={"white"}
            height="20px"
            width="70px"
            p="4px"
            value={customTokensToMint}
            onChange={(e) =>
              setCustomTokensToMint(filteredInput(e.target.value))
            }
          />
        </Button>
        <Button
          bg={"rgba(55, 255, 139, 1)"}
          borderRadius={"50%"}
          width="70px"
          minWidth="70px"
          height="70px"
          p="0"
          isDisabled={
            Number(
              formatIncompleteNumber(
                customAmountSelected ? customTokensToMint : selectedTokensToMint
              )
            ) === 0 ||
            !user ||
            !walletIsConnected
          }
          onClick={async () => {
            const n = customAmountSelected
              ? customTokensToMint
              : selectedTokensToMint;
            if (n === "0") return;
            await mintCallback(contract1155Address, tokenId, BigInt(n));
          }}
        >
          <Text whiteSpace={"normal"} overflowWrap={"break-word"}>
            MINT NOW
          </Text>
        </Button>
      </Flex>
      <Flex>
        <Text fontSize="10px" color="rgba(187, 201, 213, 1)">
          total cost:{" "}
          {(customAmountSelected
            ? Number(customTokensToMint)
            : Number(selectedTokensToMint)) * ETH_COST_FOR_ONE_NFT_MINT}{" "}
          ETH
        </Text>
      </Flex>
    </Flex>
  );
};
