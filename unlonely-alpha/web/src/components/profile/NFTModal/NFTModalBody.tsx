import {
  ModalBody,
  SimpleGrid,
  Image,
  Flex,
  Link,
  Text,
  Button,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import centerEllipses from "../../../utils/centerEllipses";

import NFTModalHeader from "./NFTModalHeader";

export type NFTModalBodyProps = {
  styles?: any;
  children?: React.ReactNode;
  address: string;
  author: string;
  isLens: boolean;
  lensHandle?: string;
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
  isLens,
  lensHandle,
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
        <Text>
          {author ? `${author}'s` : `${centerEllipses(address, 10)}`} NFTs
        </Text>
      </NFTModalHeader>
      <ModalBody sx={{ ...styles, ...NFTModalBodyStyles }}>
        {isLens && (
          <>
            <Button bgColor="#befb5a" mb="1rem">
              <Image
                src="/images/lens_logo.png"
                width="20px"
                height="20px"
                mr="5px"
              />
              <a
                href={`https://www.lensfrens.xyz/${lensHandle}/follow`}
                target="_blank"
              >
                follow on Lens
              </a>
            </Button>
          </>
        )}
        <SimpleGrid columns={3} width="100%">
          {loading && <Text>Loading...</Text>}
          {nftList &&
            nftList.length > 0 &&
            nftList.map((nft: any) => (
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
          {(!nftList || (nftList.length === 0 && !loading)) && (
            <Text>No NFTs found</Text>
          )}
        </SimpleGrid>
      </ModalBody>
    </>
  );
};

export default NFTModalBody;
