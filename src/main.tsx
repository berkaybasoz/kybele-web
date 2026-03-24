import React from 'react';
import ReactDOM from 'react-dom/client';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import App from './app/App';
import { AppProviders } from './app/providers/AppProviders';
import './styles/globals.css';
import './styles/ag-grid-theme.css';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

ModuleRegistry.registerModules([AllCommunityModule]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);
