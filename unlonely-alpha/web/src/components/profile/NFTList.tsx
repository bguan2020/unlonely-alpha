import { Text } from "@chakra-ui/react";

import NFTModalRoot from "./NFTModal/NFTModalRoot";
import NFTModalBody from "./NFTModal/NFTModalBody";
import NFTModalFooter from "./NFTModal/NFTModalFooter";
import centerEllipses from "../../utils/centerEllipses";

type Props = {
  address: string;
  author: string;
};

const NFTList: React.FunctionComponent<Props> = ({
  address,
  author,
}: Props) => {
  return (
    <>
      <NFTModalRoot
        TriggerButton={
          <Text _hover={{ cursor: "pointer" }}>
            {author ? author : centerEllipses(address, 10)}:
          </Text>
        }
      >
        <NFTModalBody address={address} author={author} />
        <NFTModalFooter />
      </NFTModalRoot>
    </>
  );
};

export default NFTList;
