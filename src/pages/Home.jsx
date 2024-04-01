import React, { useEffect, useState } from "react";
import { useUser } from "../AppProvider";
import logo from "../images/logo-talma.png";
import "../style/Header.scss";
import CreateRequest from "./CreateRequest";
import Requests from "./Requests";
import { Navigate } from "react-router-dom";

export default function Home() {
  const [isVisibleSolicitudes, setIsVisibleSolicitudes] = useState(true);
  const { user, logout } = useUser();
  const [name, setName] = useState(user?.nombre);
  const [lastName, setLastName] = useState(user?.apellido);
  
  
  
  useEffect(() => {
    setName(user.nombre);
    setLastName(user.apellido);
  }, [])
  
  const isLoggedIn = !!user; // Comprueba si el usuario está autenticado

  const handleLogout = async () => {
    setIsVisibleSolicitudes(false);
    logout();
  };

  // Redirigir al usuario a /login si no está autenticado
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  const toggleVisibilitySolicitudes = (e) => {
    setIsVisibleSolicitudes(!isVisibleSolicitudes); // Invierte el estado actual
    console.log(e.target);
  };

  return (
    <div className="home-page">
      <div className="header bg-blue">
        <img src={logo} alt="Logo" />
        <ul>
          <li
            className={isVisibleSolicitudes ? "white selected" : "white"}
            onClick={toggleVisibilitySolicitudes}
          >
            Crear solicitud
          </li>
          <li
            className={isVisibleSolicitudes ? "white" : "white selected"}
            onClick={toggleVisibilitySolicitudes}
          >
            Solicitudes
          </li>
        </ul>
        <div className="user-container">
          <p>
             {user? `Bienvenido, ${name} ${lastName}` : '¡Bienvenido!'}
          </p>
          <button className="bg-white blue" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
      <div className="container-home">
        {isVisibleSolicitudes && <CreateRequest />}

        {!isVisibleSolicitudes && <Requests />}
      </div>
    </div>
  );
}
