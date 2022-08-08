import {
  ModalBody,
  SimpleGrid,
  Image,
  Flex,
  Link,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import NFTModalHeader from "./NFTModalHeader";

export type NFTModalBodyProps = {
  styles?: any;
  children?: React.ReactNode;
  address: string;
  author: string;
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
  styles,
  address,
  author,
}) => {
  const [nftList, setNftList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTList = async () => {
      setLoading(true);
      try {
        const { assets } = await fetch(
          `https://api.opensea.io/api/v1/assets?owner=${address}&limit=100`
        ).then((res) => res.json());
        setNftList(assets);
      } catch (error: any) {
        setError(error.message);
      }
      setLoading(false);
    };
    fetchNFTList();
  }, [address]);

  return (
    <>
      <NFTModalHeader styles={{ marginTop: "33px" }}>
        {error && <Text>{error}</Text>}
        <Text>{author === "me" ? "Your" : `${author}'s`} NFTs</Text>
      </NFTModalHeader>
      <ModalBody sx={{ ...styles, ...NFTModalBodyStyles }}>
        <SimpleGrid columns={3} width="100%">
          {loading && <Text>Loading...</Text>}
          {nftList.map((nft: any) => (
            <Flex key={nft.id} m="10px">
              <Link href={nft.permalink} isExternal>
                <Image
                  src={nft.image_url}
                  alt={nft.name}
                  width="100px"
                  height="100px"
                  maxHeight="100px"
                />
              </Link>
            </Flex>
          ))}
        </SimpleGrid>
      </ModalBody>
    </>
  );
};

export default NFTModalBody;
