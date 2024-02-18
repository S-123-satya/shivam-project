import { useState } from "react";
// import './App.css'
import Registration from "./components/Registration/Registration";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Registration />
    </>
  );
}

export default App;
