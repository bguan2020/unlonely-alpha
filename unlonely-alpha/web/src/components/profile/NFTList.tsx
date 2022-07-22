import { Flex, SimpleGrid, Text, Image, Link } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import NFTModalHeader from "./NFTModal/NFTModalHeader";
import NFTModalRoot from "./NFTModal/NFTModalRoot";
import NFTModalBody from "./NFTModal/NFTModalBody";
import NFTModalFooter from "./NFTModal/NFTModalFooter";

type Props = {
  address: string;
  author: string;
};

const NFTList: React.FunctionComponent<Props> = ({
  address,
  author,
}: Props) => {
  // useeffect to call async opensea api
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
      <NFTModalRoot
        TriggerButton={<Text _hover={{ cursor: "pointer" }}>{author}:</Text>}
      >
        <NFTModalHeader styles={{ marginTop: "33px" }}>
          {error && <Text>{error}</Text>}
          <Text>{author === "me" ? "Your" : `${author}'s`} NFTs</Text>
        </NFTModalHeader>
        <NFTModalBody>
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
        </NFTModalBody>
        <NFTModalFooter />
      </NFTModalRoot>
    </>
  );
};

export default NFTList;
