import './App.css';

import { ErrorBoundary } from 'react-error-boundary';

import { RootProviders } from './providers/RootProvider';
import { Router } from './Router';

function App() {
  return (
    <ErrorBoundary fallback={<h1>Something went wrong</h1>}>
      <RootProviders>
        <Router />
      </RootProviders>
    </ErrorBoundary>
  );
}

export default App;
