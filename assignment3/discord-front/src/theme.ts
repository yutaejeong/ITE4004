import { ThemeConfig, extendTheme } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const styles = {
  global: {
    body: {
      color: "#EBF8FF",
      bg: "#282c34",
    },
  },
};

const fonts = {
  body: "Pretendard",
  heading: "Pretendard",
};

export const theme = extendTheme({ config, styles, fonts });
