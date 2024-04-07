import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

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

const theme = extendTheme({ styles, fonts });

root.render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>,
);
