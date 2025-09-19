import "./App.css";
import { RootProviders } from "./providers/RootProvider";
import { Router } from "./Router";

function App() {


  return (
    <RootProviders>
      <Router />
    </RootProviders>
  );
}

export default App;
