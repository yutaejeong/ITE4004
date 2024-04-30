import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { Provider, createStore } from "jotai";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { theme } from "./theme";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

const store = createStore();

root.render(
  <>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <Provider store={store}>
        <App />
      </Provider>
    </ChakraProvider>
  </>,
);
