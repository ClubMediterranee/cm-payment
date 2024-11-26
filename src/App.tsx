import "./App.css";
import { useResize } from "./hooks/useResize";
import { RootProviders } from "./providers/RootProvider";
import { Router } from "./Router";

function App() {
  const withLayout = window.top === window.self;
  useResize();

  return (
    <RootProviders>
      <Router withLayout={withLayout} />
    </RootProviders>
  );
}

export default App;
