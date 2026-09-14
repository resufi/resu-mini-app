
import './polyfills';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { THEME, TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App';
import './styles/tokens.css';
import { env } from "./lib/env.ts";
import { TWA_RETURN_URL } from "./lib/site.ts";
import { installTelegramMock } from "./lib/telegramMock.ts";

installTelegramMock();

const manifestUrl =
	env("VITE_TONCONNECT_MANIFEST_URL") ??
	new URL(

		`${import.meta.env.BASE_URL}tonconnect-manifest.json`.replace(/\/{2,}/g, "/"),
		window.location.origin,
	).toString();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <TonConnectUIProvider
            manifestUrl={manifestUrl}
            uiPreferences={{ theme: THEME.LIGHT }}
            actionsConfiguration={
                TWA_RETURN_URL
                    ? { twaReturnUrl: TWA_RETURN_URL as `${string}://${string}` }
                    : undefined
            }
        >
            <App />
        </TonConnectUIProvider>
    </React.StrictMode>,
);
