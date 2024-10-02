import { extendTheme } from "@chakra-ui/react";
import { StyleFunctionProps } from "@chakra-ui/theme-tools";

import breakpoints from "./breakpoints";

const inputSelectOutlineStyle = {
  border: "none",
  boxShadow: "inset 0 0 0 1.5px var(--chakra-colors-gray-600)",
  borderRadius: "12px",
  fontSize: "15px",
  fontWeight: "600",
  lineHeight: "1.2",
  background: "black",
  _placeholder: {
    color: "gray.600",
  },
  padding: "15px 18px",
};

const inputGlow = {
  borderWidth: "1px",
  borderRadius: "10px",
  borderColor: "#51bfe0",
  bg: "rgba(36, 79, 167, 0.05)",
  variant: "unstyled",
  px: "16px",
  py: "10px",
  boxShadow: "0px 0px 8px #4388b6",
  _placeholder: {
    color: "gray.600",
  },
};

export default extendTheme({
  breakpoints,
  initialColorMode: "dark",

  colors: {
    background: "#000",
    white: "#fff",
    black: "#000",
    gray: {
      100: "hsla(240, 10%, 96%, 1)", // F4F4F6
      200: "hsla(252, 33%, 97%, 1)", // F6F5FA
      300: "hsla(257, 26%, 95%, 1)", // F0EEF5
      400: "hsla(253, 20%, 91%, 1)", // E6E4ED
      500: "hsla(231, 14%, 81%, 1)", // C9CBD6
      550: "hsla(230, 8%, 71%, 1)", // B0B2BC
      600: "hsla(252, 11%, 74%, 1)", // B8B5C4
      650: "hsla(256, 11%, 60%, 1)", // 948EA5
      700: "hsla(256, 12%, 47%, 1)", // 726A88
      800: "hsla(251, 15%, 22%, 1)", // 322F3F
      900: "hsla(255, 43%, 21%, 1)", // 291E4B
    },
    salmon: {
      200: "hsla(0, 100%, 97%, 1)",
      500: "hsla(0, 100%, 71%, 1)",
    },
    blue: {
      500: "hsla(234, 100%, 62%, 1)",
      600: "hsla(248, 100%, 50%, 1)",
    },
    green: {
      400: "hsla(148, 61%, 63%, 1)",
    },
  },

  fonts: {
    body: "LoRes15, sans-serif",
    heading: "LoRes15, sans-serif",
  },

  styles: {
    global: {
      body: {
        color: "white",
        fontFamily: "Space Mono, monospace",
        fontVariantLigatures: "none",
        background: "black",
      },
    },
  },

  components: {
    Button: {
      baseStyle: {
        fontWeight: "600",
      },
      sizes: {
        sm: {
          borderRadius: "5px",
          fontSize: "14px",
          px: "12px",
          height: "26px",
        },
        md: {
          borderRadius: "5px",
          fontSize: "15px",
          px: "28px",
          height: "40px",
        },
      },
      variants: {
        regular: {
          bg: "gray.400",
          color: "gray.900",
        },
        dark: {
          bg: "gray.900",
          color: "gray.100",
        },
        transparent: {
          bg: "transparent",
          color: "gray.900",
        },
        selected: {
          bg: "gray.700",
          color: "white",
        },
        submit: {
          bg: "blue.500",
          color: "white",
        },

        "shiny.blue": {
          bg: "#101D94",
          color: "white",
          // boxShadow: "inset 0px -6px 12px rgba(255, 255, 255, 0.5)",
          _hover: {
            _disabled: {
              opacity: 0.4,
              bg: "black",
              color: "white",
            },
          },
        },
        "shiny.white": {
          bg: "white",
          boxShadow: "inset 0px -6px 12px #291e4b1a",
          color: "gray.900",
          borderStyle: "solid",
          borderWidth: "1px",
          borderColor: "gray.500",
        },
        "shiny.black": {
          bg: "black",
          // boxShadow: "inset 0px -6px 12px #291e4b1a",
          color: "white",
        },
        "shiny.red": {
          bg: "#9D0000",
          color: "white",
          fontWeight: "semibold",
        },

        /*   Special cases   */
        "topicToggle.selected": {
          borderRadius: "8px",
          background: "gray.400",
          border: "none",
          color: "#706C7C",
          boxSizing: "border-box",
          fontSize: "15px",
        },
        "topicToggle.unselected": {
          borderRadius: "8px",
          boxShadow: "inset 0 0 0 1.5px var(--chakra-colors-gray-400)",
          color: "#706C7C",
          fontSize: "15px",
        },

        full: {
          width: "100%",
          height: "fit-content",
          padding: "10px",
          backgroundColor: "#303030",
          fontSize: "20px",
          fontWeight: "semibold",
          lineHeight: "28px",
          borderRadius: "12px",
          color: "#9E9E9E",
        },

        toggle: {
          height: "26px",
          width: "26px",
          minWidth: 0,
          borderRadius: "6px",
          paddingStart: 0,
          paddingEnd: 0,
          color: "gray.650",
        },
        "toggle.active": (props: StyleFunctionProps) => ({
          ...props.theme.components.Button.variants.toggle,
          background: "gray.400",
        }),
      },
    },
    FormLabel: {
      variants: {
        indented: {
          fontSize: "15px",
          fontWeight: "600",
          lineHeight: "2rem",
          mx: "16px",
          color: "input.label",
        },
      },
    },
    Textarea: {
      variants: {
        outline: {
          ...inputSelectOutlineStyle,
        },
      },
    },
    NumberInput: {
      variants: {
        outline: {
          field: {
            ...inputSelectOutlineStyle,
          },
        },
      },
    },
    Select: {
      variants: {
        outline: {
          field: {
            bg: "rgba(36, 79, 167, 0.05)",
            borderRadius: "10px",
            borderColor: "#244FA7",
            borderWidth: "1px",
          },
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderColor: "#244FA7",
          borderRadius: "10px",
          background: "#244FA70D",
        },
      },
      variants: {
        outline: {
          field: {
            ...inputSelectOutlineStyle,
          },
        },
        filled: {
          field: {
            bg: "#EBE8F2BF",
            borderRadius: 20,
            color: "#291E4BA8",
          },
        },
        glow: {
          field: {
            ...inputGlow,
          },
        },
        greenGlow: {
          field: {
            ...inputGlow,
            boxShadow: "0px 0px 8px #32a852",
            borderColor: "#16f051",
          },
        },
        redGlow: {
          field: {
            ...inputGlow,
            boxShadow: "0px 0px 8px #a83232",
            borderColor: "#ff5454",
          },
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: "md",
          bg: "rgb(26, 50, 56)",
        },
      },
    },
  },
});
