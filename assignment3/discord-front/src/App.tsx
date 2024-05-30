import { useColorMode } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { channelAtom } from "./atoms/channel";
import { userAtom } from "./atoms/user";
import { LoginContainer } from "./containers/login/LoginContainer";
import { RoomContainer } from "./containers/room/RoomContainer";
import { ChannelContainer } from "./containers/channels/ChannelContainer";

function App() {
  const { nickname } = useAtomValue(userAtom);
  const channel = useAtomValue(channelAtom);
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    if (colorMode === "light") {
      toggleColorMode();
    }
  }, [colorMode, toggleColorMode]);

  if (!nickname) {
    return <LoginContainer />;
  }

  if (!channel) {
    return <ChannelContainer />;
  }

  return <RoomContainer />;
}

export default App;
