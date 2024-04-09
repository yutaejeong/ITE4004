import { useColorMode } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LoginContainer } from "./containers/login/LoginContainer";
import { RoomContainer } from "./containers/room/RoomContainer";

function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [nickname, setNickname] = useState<string>("");

  useEffect(() => {
    if (colorMode === "light") {
      toggleColorMode();
    }
  }, [colorMode, toggleColorMode]);

  return nickname ? (
    <RoomContainer nickname={nickname} />
  ) : (
    <LoginContainer setNickname={setNickname} />
  );
}

export default App;
