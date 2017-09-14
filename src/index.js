import React from 'react';
import ReactDOM from 'react-dom';
import {
  ApolloProvider,
  createNetworkInterface,
  ApolloClient,
  gql
} from 'react-apollo';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { authMiddleware } from './auth';
import { ClipboardProvider } from './withClipboard';
// import registerServiceWorker from './registerServiceWorker';

const networkInterface = createNetworkInterface({ uri: '/api/graphql' });
networkInterface.use([authMiddleware]);

const client = new ApolloClient({ networkInterface });

window.gql = gql;
ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <ClipboardProvider>
        <App />
      </ClipboardProvider>
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root')
);
// registerServiceWorker();
