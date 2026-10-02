import './App.css';

import { CapsMessageType } from '@clubmed/caps';
import { ErrorBoundary } from 'react-error-boundary';

import { EmbeddedProvider, usePostToHost } from './embedded/EmbeddedProvider';
import { RootProviders } from './providers/RootProvider';
import { Router } from './Router';

function AppContent() {
  const postToHost = usePostToHost();

  return (
    <ErrorBoundary
      fallback={<h1>Something went wrong</h1>}
      onError={(error) =>
        postToHost(CapsMessageType.ERROR, {
          code: 'FLOW_ERROR',
          message: error instanceof Error ? error.message : String(error),
        })
      }
    >
      <RootProviders>
        <Router />
      </RootProviders>
    </ErrorBoundary>
  );
}

function App() {
  // Outside the error boundary: the host keeps receiving messages (resize, errors) when the flow fails.
  return (
    <EmbeddedProvider>
      <AppContent />
    </EmbeddedProvider>
  );
}

export default App;
