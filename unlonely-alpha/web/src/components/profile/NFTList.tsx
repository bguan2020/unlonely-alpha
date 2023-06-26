import { Text } from "@chakra-ui/react";

import NFTModalRoot from "./NFTModal/NFTModalRoot";
import NFTModalBody from "./NFTModal/NFTModalBody";
import NFTModalFooter from "./NFTModal/NFTModalFooter";
import centerEllipses from "../../utils/centerEllipses";

type Props = {
  address: string;
  author: string;
  isLens: boolean;
  lensHandle?: string;
  mobile?: boolean;
};

const NFTList: React.FunctionComponent<Props> = ({
  address,
  author,
  isLens,
  lensHandle,
  mobile,
}: Props) => {
  return (
    <>
      {mobile ? (
        <Text _hover={{ cursor: "pointer" }} fontSize="16px">
          {author ? author : centerEllipses(address, 10)}:
        </Text>
      ) : (
        <NFTModalRoot
          TriggerButton={
            <Text _hover={{ cursor: "pointer" }} fontSize="16px">
              {author ? author : centerEllipses(address, 10)}:
            </Text>
          }
        >
          <NFTModalBody
            address={address}
            author={author}
            isLens={isLens}
            lensHandle={lensHandle}
          />
          <NFTModalFooter />
        </NFTModalRoot>
      )}
    </>
  );
};

export default NFTList;
