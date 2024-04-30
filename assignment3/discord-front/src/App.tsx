import { useColorMode } from "@chakra-ui/react";
import { useEffect } from "react";
import { LoginContainer } from "./containers/login/LoginContainer";
import { RoomContainer } from "./containers/room/RoomContainer";
import { useAtomValue } from "jotai";
import { userAtom } from "./atoms/user";

function App() {
  const { nickname } = useAtomValue(userAtom);
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    if (colorMode === "light") {
      toggleColorMode();
    }
  }, [colorMode, toggleColorMode]);

  return nickname ? <RoomContainer /> : <LoginContainer />;
}

export default App;
