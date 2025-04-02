import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from 'react-error-boundary';
import FallBackPage from './components/FallbackPage';
import { store } from './redux/store';
import { Provider } from 'react-redux';
import ToastProvider from './components/ToastProvider';
// @ts-ignore
import { IdentityKitProvider } from '@nfid/identitykit/react';
import { NFIDW, Plug, InternetIdentity, Stoic, OISY } from '@nfid/identitykit';
import vetkd from 'ic-vetkd-utils';
import '@nfid/identitykit/react/styles.css';
import './styles/index.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary fallbackRender={FallBackPage}>
    <IdentityKitProvider signers={[NFIDW, Plug, InternetIdentity, Stoic, OISY]}>
      <Provider store={store}>
        <App />
        <ToastProvider />
      </Provider>
    </IdentityKitProvider>
  </ErrorBoundary>
);

await vetkd('ic_vetkd_utils_bg.wasm');
