import {
  Button,
  Flex,
  Input,
  Text,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
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
import VibesTokenInterface from "../chat/VibesTokenInterface";

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
      title="set price zones"
      hideFooter
      loadingText="setting zones..."
    >
      <Flex direction="column" gap="16px">
        <Text fontSize="14px" color="#c7c7c7" textAlign="center">
          set green and red price zones to track $VIBES performance for you and
          your viewers!
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
            allStreams
          />
        </Flex>
        <Flex
          direction="column"
          bg="rgba(0, 0, 0, 0.4)"
          p="10px"
          borderRadius="10px"
          gap="12px"
        >
          <Flex gap="20px">
            <Flex direction="column">
              <Text textAlign={"center"} noOfLines={1} color="#d6d6d6">
                lower price
              </Text>
              <Input
                fontSize="20px"
                variant={"redGlow"}
                value={sliderValue[0]}
                onChange={(e) =>
                  setSliderValue((prev) => {
                    return [filteredInput(e.target.value, true), prev[1]];
                  })
                }
              />
              <Text
                textAlign={"center"}
                fontSize="12px"
                noOfLines={1}
                color={
                  Number(formattedCurrentPrice) === Number(sliderValue[0])
                    ? "#b4b4b4"
                    : "#ff6161"
                }
              >
                {truncateValue(
                  Number(formattedCurrentPrice) > 0
                    ? (Number(
                        parseUnits(
                          convertSciNotaToPrecise(
                            sliderValue[0]
                          ) as `${number}`,
                          18
                        )
                      ) /
                        Number(parseUnits(formattedCurrentPrice, 18))) *
                        100
                    : 0,
                  2
                )}
                % of current value
              </Text>
              <Flex justifyContent={"space-between"} gap="10px" mt="5px">
                <Flex direction="column" gap="2px">
                  <Button
                    p={2}
                    height={"20px"}
                    w="100%"
                    color="#d6d6d6"
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
                    color="#d6d6d6"
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
                                  Number(formattedCurrentPrice) * 0.01,
                                0
                              )
                            )
                          ),
                          prev[1],
                        ];
                      })
                    }
                  >
                    -1%
                  </Button>
                </Flex>
                <Button
                  p={2}
                  w="100%"
                  color={
                    Number(formattedCurrentPrice) === Number(sliderValue[0])
                      ? "#b8b8b8"
                      : "#d6d6d6"
                  }
                  bg={
                    Number(formattedCurrentPrice) === Number(sliderValue[0])
                      ? "#525252"
                      : "#133a75"
                  }
                  _focus={{}}
                  _active={{}}
                  _hover={{
                    bg: "#3267b7",
                  }}
                  onClick={() =>
                    setSliderValue((prev) => {
                      return [formattedCurrentPrice, prev[1]];
                    })
                  }
                >
                  100%
                </Button>
                <Flex direction="column" gap="2px">
                  <Button
                    p={2}
                    height={"20px"}
                    w="100%"
                    color="#d6d6d6"
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
                  <Button
                    p={2}
                    height={"20px"}
                    w="100%"
                    color="#d6d6d6"
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
                                  Number(formattedCurrentPrice) * 0.01,
                                Number(formatUnits(BigInt(MAX_VIBES_PRICE), 18))
                              )
                            )
                          ),
                          prev[1],
                        ];
                      })
                    }
                  >
                    +1%
                  </Button>
                </Flex>
              </Flex>
            </Flex>
            <Flex direction="column">
              <Text textAlign={"center"} noOfLines={1} color="#d6d6d6">
                higher price
              </Text>
              <Input
                fontSize="20px"
                variant={"greenGlow"}
                value={sliderValue[1]}
                onChange={(e) =>
                  setSliderValue((prev) => {
                    return [prev[0], filteredInput(e.target.value, true)];
                  })
                }
              />
              <Text
                textAlign={"center"}
                fontSize="12px"
                noOfLines={1}
                color={
                  Number(formattedCurrentPrice) === Number(sliderValue[1])
                    ? "#b4b4b4"
                    : "#60e601"
                }
              >
                {truncateValue(
                  Number(formattedCurrentPrice) > 0
                    ? (Number(
                        parseUnits(
                          convertSciNotaToPrecise(
                            sliderValue[1]
                          ) as `${number}`,
                          18
                        )
                      ) /
                        Number(parseUnits(formattedCurrentPrice, 18))) *
                        100
                    : 0,
                  2
                )}
                % of current value
              </Text>
              <Flex justifyContent={"space-between"} gap="10px" mt="5px">
                <Flex direction="column" gap="2px">
                  <Button
                    p={2}
                    height={"20px"}
                    w="100%"
                    color="#d6d6d6"
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
                    color="#d6d6d6"
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
                                  Number(formattedCurrentPrice) * 0.01,
                                0
                              )
                            )
                          ),
                        ];
                      })
                    }
                  >
                    -1%
                  </Button>
                </Flex>
                <Button
                  p={2}
                  w="100%"
                  color={
                    Number(formattedCurrentPrice) === Number(sliderValue[1])
                      ? "#b8b8b8"
                      : "#d6d6d6"
                  }
                  bg={
                    Number(formattedCurrentPrice) === Number(sliderValue[1])
                      ? "#525252"
                      : "#133a75"
                  }
                  _focus={{}}
                  _active={{}}
                  _hover={{
                    bg: "#3267b7",
                  }}
                  onClick={() =>
                    setSliderValue((prev) => {
                      return [prev[0], formattedCurrentPrice];
                    })
                  }
                >
                  100%
                </Button>
                <Flex direction="column" gap="2px">
                  <Button
                    p={2}
                    height={"20px"}
                    w="100%"
                    color="#d6d6d6"
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
                  <Button
                    p={2}
                    height={"20px"}
                    w="100%"
                    color="#d6d6d6"
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
                                  Number(formattedCurrentPrice) * 0.01,
                                Number(formatUnits(BigInt(MAX_VIBES_PRICE), 18))
                              )
                            )
                          ),
                        ];
                      })
                    }
                  >
                    +1%
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
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
