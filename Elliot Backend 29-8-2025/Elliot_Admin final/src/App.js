import React, { useEffect } from 'react';
import './App.css';
import './Responsive.css';
import RoutesComponent from './RoutesComponent';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from "react-redux";
import store from "./redux/store";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Provider store={store}>
      <RoutesComponent />
      <ToastContainer toastStyle={{ fontSize: '16px', }} />
    </Provider>
  );
}

export default App;