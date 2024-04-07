import { useState } from "react";
import { LoginContainer } from "./containers/login/LoginContainer";
import { RoomContainer } from "./containers/room/RoomContainer";

function App() {
  const [nickname, setNickname] = useState<string>("");

  return nickname ? (
    <RoomContainer nickname={nickname} />
  ) : (
    <LoginContainer setNickname={setNickname} />
  );
}

export default App;
