import React from "react";import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import './App.scss';
import Login from './pages/Login';
import Home from './pages/Home';
import { AppProvider } from './AppProvider';

export default function App() {
  return (
    <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/home"
              element={<Home />}
            ></Route>
            <Route
              path="/login"
              element={<Login />}
            ></Route>
            <Route
              path="/"
              element={<Navigate replace to="/login" />}
            ></Route>
          </Routes>
        </BrowserRouter>
    </AppProvider>
  );
}