import { Button, Flex, Text, Spinner } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatUnits, parseUnits } from "viem";

import {
  AblyChannelPromise,
  MAX_VIBES_PRICE,
  VIBES_TOKEN_PRICE_RANGE_EVENT,
} from "../../constants";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";
import { useChannelContext } from "../../hooks/context/useChannel";
import useUpdateChannelVibesTokenPriceRange from "../../hooks/server/useUpdateChannelVibesTokenPriceRange";
import VibesTokenInterface from "../chat/VibesTokenInterface";
import VibesTokenZoneModalControls from "./VibesTokenZoneModalControls";
import { convertSciNotaToPrecise } from "../../utils/tokenDisplayFormatting";

const tips = [
  "set the green and red price range indicators to track $VIBES performance",
  "the percentages below the input fields show how they compare to the current price",
  "use the slider to adjust the range, from 0 to the highest possible price",
  'click on the "100%" button to reset the input field(s) to the current price',
  "scroll your mouse wheel over the input fields to adjust prices more precisely",
];

const VibesTokenZoneModal = ({
  formattedCurrentPrice,
  isOpen,
  handleClose,
  ablyChannel,
}: {
  formattedCurrentPrice: `${number}`;
  isOpen: boolean;
  handleClose: () => void;
  ablyChannel?: AblyChannelPromise;
}) => {
  const [sliderValue, setSliderValue] = useState<string[]>([
    formattedCurrentPrice,
    formattedCurrentPrice,
  ]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const { channel } = useChannelContext();
  const { channelQueryData } = channel;
  const mounting = useRef(true);

  const { updateChannelVibesTokenPriceRange, loading } =
    useUpdateChannelVibesTokenPriceRange({});

  const submit = async (clear?: boolean) => {
    await updateChannelVibesTokenPriceRange({
      id: channelQueryData?.id,
      vibesTokenPriceRange: clear ? [] : sliderValue,
    });
    ablyChannel?.publish({
      name: VIBES_TOKEN_PRICE_RANGE_EVENT,
      data: { body: clear ? "" : sliderValue.join() },
    });
    handleClose();
  };

  const _handleClose = () => {
    if (channelQueryData?.vibesTokenPriceRange?.length === 0)
      setSliderValue([formattedCurrentPrice, formattedCurrentPrice]);
    if (channelQueryData?.vibesTokenPriceRange?.length === 2)
      setSliderValue(
        channelQueryData?.vibesTokenPriceRange.filter(
          (str): str is string => str !== null
        )
      );
    handleClose();
  };

  useEffect(() => {
    if (Number(formattedCurrentPrice) > 0 && mounting.current) {
      mounting.current = false;
      setSliderValue([formattedCurrentPrice, formattedCurrentPrice]);
    }
  }, [formattedCurrentPrice]);

  useEffect(() => {
    if (channelQueryData?.vibesTokenPriceRange) {
      const filteredArray = channelQueryData?.vibesTokenPriceRange.filter(
        (str): str is string => str !== null
      );
      if (filteredArray?.length === 2) {
        setSliderValue(filteredArray);
      }
    }
  }, [channelQueryData?.vibesTokenPriceRange]);

  const handleSliderPercentage = useCallback(
    (val: number, price: "green" | "red", direction: "up" | "down") => {
      if (price === "green") {
        if (direction === "up") {
          setSliderValue((prev) => {
            return [
              prev[0],
              convertSciNotaToPrecise(
                String(
                  Math.min(
                    Number(prev[1]) + Number(formattedCurrentPrice) * val,
                    Number(formatUnits(BigInt(MAX_VIBES_PRICE), 18))
                  )
                )
              ),
            ];
          });
        } else {
          setSliderValue((prev) => {
            return [
              prev[0],
              convertSciNotaToPrecise(
                String(
                  Math.max(
                    Number(prev[1]) - Number(formattedCurrentPrice) * val,
                    0
                  )
                )
              ),
            ];
          });
        }
      } else {
        if (direction === "up") {
          setSliderValue((prev) => {
            return [
              convertSciNotaToPrecise(
                String(
                  Math.min(
                    Number(prev[0]) + Number(formattedCurrentPrice) * val,
                    Number(formatUnits(BigInt(MAX_VIBES_PRICE), 18))
                  )
                )
              ),
              prev[1],
            ];
          });
        } else {
          setSliderValue((prev) => {
            return [
              convertSciNotaToPrecise(
                String(
                  Math.max(
                    Number(prev[0]) - Number(formattedCurrentPrice) * val,
                    0
                  )
                )
              ),
              prev[1],
            ];
          });
        }
      }
    },
    [formattedCurrentPrice]
  );

  const handleSliderValue = useCallback(
    (val: string[], replacing: "red" | "green" | "all") => {
      if (replacing === "all") {
        setSliderValue(val);
      } else if (replacing === "red") {
        setSliderValue((prev) => {
          return [val[0], prev[1]];
        });
      } else {
        setSliderValue((prev) => {
          return [prev[0], val[1]];
        });
      }
    },
    []
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TransactionModalTemplate
      isOpen={isOpen}
      handleClose={_handleClose}
      title="set price zones"
      hideFooter
      loadingText="setting zones..."
    >
      <Flex direction="column" gap="16px">
        <Text fontSize="14px" color="#c7c7c7" textAlign="center" noOfLines={2}>
          {`(${currentTipIndex + 1}/${tips.length}) `}
          {tips[currentTipIndex]}
        </Text>
        <Flex
          gap="15px"
          bg="rgba(0, 0, 0, 0.6)"
          p="5px"
          borderRadius="10px"
          height="200px"
        >
          <VibesTokenInterface
            defaultTimeFilter="all"
            disableExchange
            customLowerPrice={Number(
              parseUnits(sliderValue[0] as `${number}`, 18)
            )}
            customHigherPrice={Number(
              parseUnits(sliderValue[1] as `${number}`, 18)
            )}
            previewMode
          />
        </Flex>
        <VibesTokenZoneModalControls
          sliderValue={sliderValue}
          handleSliderValue={handleSliderValue}
          formattedCurrentPrice={formattedCurrentPrice}
          // setSliderValue={setSliderValue}
          handleSliderPercentage={handleSliderPercentage}
        />
        {!loading ? (
          <Flex direction="column" gap="10px">
            <Button
              color="white"
              bg="#3372d1"
              _focus={{}}
              _active={{}}
              _hover={{
                bg: "#3267b7",
              }}
              isDisabled={
                Number(sliderValue[0]) > Number(sliderValue[1]) ||
                (Number(sliderValue[0]) ===
                  Number(channelQueryData?.vibesTokenPriceRange?.[0]) &&
                  Number(sliderValue[1]) ===
                    Number(channelQueryData?.vibesTokenPriceRange?.[1]))
              }
              onClick={() => submit()}
            >
              {Number(sliderValue[0]) > Number(sliderValue[1])
                ? "invalid price range"
                : "set zones"}
            </Button>
            <Button
              bg="transparent"
              border="1px solid #ff5653"
              color="#ff5653"
              _focus={{}}
              _active={{}}
              _hover={{
                bg: "#ff5653",
                color: "white",
              }}
              onClick={() => submit(true)}
              isDisabled={channelQueryData?.vibesTokenPriceRange?.length === 0}
            >
              clear zones
            </Button>
          </Flex>
        ) : (
          <Flex justifyContent={"center"}>
            <Spinner />
          </Flex>
        )}
      </Flex>
    </TransactionModalTemplate>
  );
};

export default VibesTokenZoneModal;
