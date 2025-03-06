import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import  'bootstrap/dist/css/bootstrap.min.css' ;
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { enableIndexedDbPersistence } from "firebase/firestore"; 
import { db } from './firebase-config';
import { CssBaseline } from '@mui/material';



const darkTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#152c51',
    },
    secondary: {
      main: '#333',
    },
    background: {
      default: "#fafafa",
    }
  },
});


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={darkTheme}>
  <CssBaseline />
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </ThemeProvider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

