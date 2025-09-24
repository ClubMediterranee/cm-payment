import './App.css';

import { FormStarter } from './components/FormStarter';
import { PageLayout } from './components/PageLayout.js';
import { RootProviders } from './providers/RootProvider';

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
