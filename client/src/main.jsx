import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Auth0Provider } from "@auth0/auth0-react";
import { redirect } from 'react-router';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-g6t2rkgqrephbg6o.us.auth0.com"
      clientId="oTMfbekYQoIxPTgFAbeSo6aSVQrZVbFu"
      authorizationParams={{
        redirect_uri: window.location.origin + "/search",
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
)
