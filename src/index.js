import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import App from './App';
import theme from './theme';

// Override localhost calls to Render backend
const originalFetch = global.fetch;
global.fetch = (url, options) => {
  if (url.startsWith('http://localhost:5001')) {
    url = url.replace('http://localhost:5001', 'https://leapbackend.onrender.com');
  }
  return originalFetch(url, options);
};

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <ChakraProvider theme={theme}>
          <App />
        </ChakraProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
