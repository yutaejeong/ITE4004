import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

const fonts = {
  body: "Pretendard",
  heading: "Pretendard",
};

const theme = extendTheme({ fonts });

root.render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>,
);
