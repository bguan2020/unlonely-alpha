import {
  Button,
  Flex,
  Input,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Text,
} from "@chakra-ui/react";
import { useRef, useEffect } from "react";
import { formatUnits, parseUnits } from "viem";

import { MAX_VIBES_PRICE } from "../../../constants";
import {
  convertSciNotaToPrecise,
  truncateValue,
} from "../../../utils/tokenDisplayFormatting";
import { filteredInput } from "../../../utils/validation/input";
import { useCacheContext } from "../../../hooks/context/useCache";

const VibesTokenZoneModalControls = ({
  formattedCurrentPrice,
  sliderValue,
  handleSliderPercentage,
  handleSliderValue,
}: {
  formattedCurrentPrice: `${number}`;
  sliderValue: string[];
  handleSliderValue: (
    val: string[],
    replacing: "red" | "green" | "all"
  ) => void;
  handleSliderPercentage: (
    val: number,
    price: "green" | "red",
    direction: "up" | "down"
  ) => void;
}) => {
  const { ethPriceInUsd } = useCacheContext();
  const lowPriceRef = useRef<HTMLDivElement>(null);
  const highPriceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = lowPriceRef.current;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      handleSliderPercentage(0.005, "red", e.deltaY > 0 ? "down" : "up");
    };

    el?.addEventListener("wheel", handleWheel);
    return () => el?.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    const el = highPriceRef.current;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      handleSliderPercentage(0.005, "green", e.deltaY > 0 ? "down" : "up");
    };

    el?.addEventListener("wheel", handleWheel);
    return () => el?.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <Flex
      direction="column"
      bg="rgba(0, 0, 0, 0.4)"
      p="10px"
      borderRadius="10px"
      gap="12px"
    >
      <Flex gap="25px">
        <Flex direction="column" ref={lowPriceRef}>
          <Input
            fontSize="20px"
            variant={"redGlow"}
            value={sliderValue[0]}
            onChange={(e) =>
              handleSliderValue(
                [filteredInput(e.target.value, true), sliderValue[1]],
                "red"
              )
            }
          />
          {ethPriceInUsd !== undefined && (
            <Text
              textAlign={"center"}
              fontSize="14px"
              noOfLines={1}
              color={"#d6d6d6"}
            >
              $
              {truncateValue(
                Number(convertSciNotaToPrecise(sliderValue[0]) as `${number}`) *
                  Number(ethPriceInUsd),
                4
              )}
            </Text>
          )}
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
                      convertSciNotaToPrecise(sliderValue[0]) as `${number}`,
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
                onClick={() => handleSliderPercentage(0.05, "red", "down")}
              >
                -5%
              </Button>
            </Flex>
            <Button
              p={2}
              w="100%"
              height={"20px"}
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
                handleSliderValue(
                  [formattedCurrentPrice, sliderValue[1]],
                  "red"
                )
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
                onClick={() => handleSliderPercentage(0.05, "red", "up")}
              >
                +5%
              </Button>
            </Flex>
          </Flex>
        </Flex>
        <Flex direction="column" ref={highPriceRef}>
          <Input
            fontSize="20px"
            variant={"greenGlow"}
            value={sliderValue[1]}
            onChange={(e) =>
              handleSliderValue(
                [sliderValue[0], filteredInput(e.target.value, true)],
                "green"
              )
            }
          />
          {ethPriceInUsd !== undefined && (
            <Text
              textAlign={"center"}
              fontSize="14px"
              noOfLines={1}
              color={"#d6d6d6"}
            >
              $
              {truncateValue(
                Number(convertSciNotaToPrecise(sliderValue[1]) as `${number}`) *
                  Number(ethPriceInUsd),
                4
              )}
            </Text>
          )}
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
                      convertSciNotaToPrecise(sliderValue[1]) as `${number}`,
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
                onClick={() => handleSliderPercentage(0.05, "green", "down")}
              >
                -5%
              </Button>
            </Flex>
            <Button
              p={2}
              height={"20px"}
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
                handleSliderValue(
                  [sliderValue[0], formattedCurrentPrice],
                  "green"
                )
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
                onClick={() => handleSliderPercentage(0.05, "green", "up")}
              >
                +5%
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <RangeSlider
        aria-label={["min", "max"]}
        value={sliderValue.map((str) =>
          Number(parseUnits(convertSciNotaToPrecise(str) as `${number}`, 18))
        )}
        onChange={(val) =>
          handleSliderValue(
            val.map((num) => formatUnits(BigInt(num), 18)),
            "all"
          )
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
  );
};

export default VibesTokenZoneModalControls;
