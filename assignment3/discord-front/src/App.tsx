import { Button, Heading, Input } from "@chakra-ui/react";
import "./App.css";

function App() {
  return (
    <div className="container">
      <Heading size="3xl" color="white">
        Welcome ✨
      </Heading>
      <main className="login-area">
        <Input color="white" placeholder="사용자명" />
        <Button colorScheme="blue">입장</Button>
      </main>
    </div>
  );
}

export default App;
