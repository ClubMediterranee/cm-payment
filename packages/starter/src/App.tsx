import "./App.css";
import {RootProviders} from "./providers/RootProvider";
import {FormStarter} from "./components/FormStarter";
import {PageLayout} from "./components/PageLayout.js";

function App() {
  return (
    <RootProviders>
      <PageLayout title="Payment Starter">
        <FormStarter />
      </PageLayout>
    </RootProviders>
  );
}

export default App;
