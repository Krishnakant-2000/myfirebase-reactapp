// src/main.jsx
// This is your main entry point file. It renders the App component.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Import your main App component
import './index.css'; // Import your global CSS file

// Get the root element from your HTML (usually an element with id="root")
const rootElement = document.getElementById('root');

// Render your React application into the root element
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);