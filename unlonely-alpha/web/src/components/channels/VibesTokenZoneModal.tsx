import {
  Button,
  Flex,
  Input,
  Image,
  Text,
  Tooltip as ChakraTooltip,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FaCopy } from "react-icons/fa6";
import { parseUnits, formatUnits } from "viem";

import {
  AblyChannelPromise,
  MAX_VIBES_PRICE,
  VIBES_TOKEN_PRICE_RANGE_EVENT,
} from "../../constants";
import {
  convertSciNotaToPrecise,
  truncateValue,
} from "../../utils/tokenDisplayFormatting";
import { filteredInput } from "../../utils/validation/input";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";
import { useChannelContext } from "../../hooks/context/useChannel";
import useUpdateChannelVibesTokenPriceRange from "../../hooks/server/useUpdateChannelVibesTokenPriceRange";
import { useUser } from "../../hooks/context/useUser";

const VibesTokenZoneModal = ({
  formattedCurrentPrice,
  isOpen,
  handleClose,
  ablyChannel,
}: {
  formattedCurrentPrice: `${number}`;
  isOpen: boolean;
  handleClose: () => void;
  ablyChannel: AblyChannelPromise;
}) => {
  const { user, userAddress } = useUser();
  const [sliderValue, setSliderValue] = useState<string[]>([
    formattedCurrentPrice,
    formattedCurrentPrice,
  ]);
  const { channel, chat } = useChannelContext();
  const { channelQueryData } = channel;
  const { addToChatbot } = chat;
  const mounting = useRef(true);

  const { updateChannelVibesTokenPriceRange, loading } =
    useUpdateChannelVibesTokenPriceRange({});

  const submit = async (clear?: boolean) => {
    await updateChannelVibesTokenPriceRange({
      id: channelQueryData?.id,
      vibesTokenPriceRange: clear ? [] : sliderValue,
    });
    ablyChannel.publish({
      name: VIBES_TOKEN_PRICE_RANGE_EVENT,
      data: { body: clear ? "" : sliderValue.join() },
    });
    handleClose();
  };

  const _handleClose = () => {
    setSliderValue([formattedCurrentPrice, formattedCurrentPrice]);
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

  return (
    <TransactionModalTemplate
      isOpen={isOpen}
      handleClose={_handleClose}
      title="set zones"
      hideFooter
      loadingText="setting zones..."
    >
      <Flex direction="column" gap="16px">
        <Text fontSize="14px" color="#bababa" textAlign="center">
          set green and red price range indicators to track $VIBES performance
        </Text>
        <Text fontSize="14px" color="#bababa" textAlign={"center"}>
          use the slider or plug in your own numbers
        </Text>
        <Flex
          direction={"column"}
          gap="15px"
          bg="rgba(0, 0, 0, 0.6)"
          p="20px"
          borderRadius="10px"
        >
          <Flex justifyContent={"space-between"}>
            <IconButton
              border={
                Number(formattedCurrentPrice) === Number(sliderValue[0])
                  ? undefined
                  : "1px solid #ff3d3d"
              }
              aria-label="copy price to lower"
              icon={<FaCopy />}
              bg="transparent"
              _hover={{
                transform: "scale(1.1)",
              }}
              color={
                Number(formattedCurrentPrice) === Number(sliderValue[0])
                  ? "#636363"
                  : "#ff3d3d"
              }
              _focus={{}}
              _active={{}}
              onClick={() =>
                setSliderValue((prev) => {
                  return [formattedCurrentPrice, prev[1]];
                })
              }
            />
            <Text fontSize="20px" textAlign={"center"}>
              Current price in ETH
              <Text color="#f8f53b">{formattedCurrentPrice}</Text>
            </Text>
            <IconButton
              border={
                Number(formattedCurrentPrice) === Number(sliderValue[1])
                  ? undefined
                  : "1px solid #46a800"
              }
              aria-label="copy price to higher"
              icon={<FaCopy />}
              bg="transparent"
              _hover={{
                transform: "scale(1.1)",
              }}
              color={
                Number(formattedCurrentPrice) === Number(sliderValue[1])
                  ? "#636363"
                  : "#46a800"
              }
              _focus={{}}
              _active={{}}
              onClick={() =>
                setSliderValue((prev) => {
                  return [prev[0], formattedCurrentPrice];
                })
              }
            />
          </Flex>
        </Flex>
        <Flex
          bg="rgba(0, 0, 0, 0.4)"
          p="5px"
          borderRadius="10px"
          direction="column"
          gap="5px"
        >
          <RangeSlider
            aria-label={["min", "max"]}
            value={sliderValue.map((str) =>
              Number(
                parseUnits(convertSciNotaToPrecise(str) as `${number}`, 18)
              )
            )}
            onChange={(val) =>
              setSliderValue(val.map((num) => formatUnits(BigInt(num), 18)))
            }
            min={0}
            max={MAX_VIBES_PRICE}
          >
            <RangeSliderTrack bg={"#403c7d"}>
              <RangeSliderFilledTrack bg={"#c4c1f5"} />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} boxSize={"5"} sx={{ bg: "#ff3d3d" }} />
            <RangeSliderThumb index={1} boxSize={"5"} sx={{ bg: "#46a800" }} />
          </RangeSlider>
        </Flex>
        <Flex gap="20px" bg="rgba(0, 0, 0, 0.4)" p="10px" borderRadius="10px">
          <Flex direction="column">
            <Text textAlign={"center"} noOfLines={1}>
              lower price
              <ChakraTooltip
                label="percentage of current price"
                shouldWrapChildren
              >
                <Image src="/svg/info.svg" width="16px" height="16px" />
              </ChakraTooltip>
            </Text>
            <Text
              textAlign={"center"}
              fontSize="25px"
              noOfLines={1}
              color="#ff6161"
            >
              {truncateValue(
                Number(formattedCurrentPrice) > 0
                  ? (Number(
                      parseUnits(
                        convertSciNotaToPrecise(sliderValue[0]) as `${number}`,
                        18
                      )
                    ) /
                      Number(parseUnits(formattedCurrentPrice, 18))) *
                      100
                  : 0,
                2
              )}
              %
            </Text>
            <Input
              variant={"redGlow"}
              value={sliderValue[0]}
              onChange={(e) =>
                setSliderValue((prev) => {
                  return [filteredInput(e.target.value, true), prev[1]];
                })
              }
            />
            <Flex justifyContent={"space-between"} gap="10px" mt="5px">
              <Button
                p={2}
                height={"20px"}
                w="100%"
                color="white"
                bg="#133a75"
                _focus={{}}
                _active={{}}
                _hover={{
                  bg: "#3267b7",
                }}
                onClick={() =>
                  setSliderValue((prev) => {
                    return [
                      convertSciNotaToPrecise(
                        String(
                          Math.max(
                            Number(prev[0]) -
                              Number(formattedCurrentPrice) * 0.05,
                            0
                          )
                        )
                      ),
                      prev[1],
                    ];
                  })
                }
              >
                -5%
              </Button>
              <Button
                p={2}
                height={"20px"}
                w="100%"
                color="white"
                bg="#133a75"
                _focus={{}}
                _active={{}}
                _hover={{
                  bg: "#3267b7",
                }}
                onClick={() =>
                  setSliderValue((prev) => {
                    return [
                      convertSciNotaToPrecise(
                        String(
                          Math.min(
                            Number(prev[0]) +
                              Number(formattedCurrentPrice) * 0.05,
                            Number(formatUnits(BigInt(MAX_VIBES_PRICE), 18))
                          )
                        )
                      ),
                      prev[1],
                    ];
                  })
                }
              >
                +5%
              </Button>
            </Flex>
          </Flex>
          <Flex direction="column">
            <Text textAlign={"center"} noOfLines={1}>
              higher price
              <ChakraTooltip
                label="percentage of current price"
                shouldWrapChildren
              >
                <Image src="/svg/info.svg" width="16px" height="16px" />
              </ChakraTooltip>
            </Text>
            <Text
              textAlign={"center"}
              fontSize="25px"
              noOfLines={1}
              color="#60e601"
            >
              {truncateValue(
                Number(formattedCurrentPrice) > 0
                  ? (Number(
                      parseUnits(
                        convertSciNotaToPrecise(sliderValue[1]) as `${number}`,
                        18
                      )
                    ) /
                      Number(parseUnits(formattedCurrentPrice, 18))) *
                      100
                  : 0,
                2
              )}
              %
            </Text>
            <Input
              variant={"greenGlow"}
              value={sliderValue[1]}
              onChange={(e) =>
                setSliderValue((prev) => {
                  return [prev[0], filteredInput(e.target.value, true)];
                })
              }
            />
            <Flex justifyContent={"space-between"} gap="10px" mt="5px">
              <Button
                p={2}
                height={"20px"}
                w="100%"
                color="white"
                bg="#133a75"
                _focus={{}}
                _active={{}}
                _hover={{
                  bg: "#3267b7",
                }}
                onClick={() =>
                  setSliderValue((prev) => {
                    return [
                      prev[0],
                      convertSciNotaToPrecise(
                        String(
                          Math.max(
                            Number(prev[1]) -
                              Number(formattedCurrentPrice) * 0.05,
                            0
                          )
                        )
                      ),
                    ];
                  })
                }
              >
                -5%
              </Button>
              <Button
                p={2}
                height={"20px"}
                w="100%"
                color="white"
                bg="#133a75"
                _focus={{}}
                _active={{}}
                _hover={{
                  bg: "#3267b7",
                }}
                onClick={() =>
                  setSliderValue((prev) => {
                    return [
                      prev[0],
                      convertSciNotaToPrecise(
                        String(
                          Math.min(
                            Number(prev[1]) +
                              Number(formattedCurrentPrice) * 0.05,
                            Number(formatUnits(BigInt(MAX_VIBES_PRICE), 18))
                          )
                        )
                      ),
                    ];
                  })
                }
              >
                +5%
              </Button>
            </Flex>
          </Flex>
        </Flex>
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
              isDisabled={Number(sliderValue[0]) > Number(sliderValue[1])}
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
