import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import { useUser } from "../AppProvider";
import usuariosData from "../users.json";
import "../style/Login.scss";
import logo from "../images/logo-talma-blanco.svg";
import line from "../images/line.png";

export default function Login() {
  const { login } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    const user = usuariosData.find((user) => user.username === username);
    const passwordWrite = usuariosData.find(
      (user) => user.password === password
    );

    if (user) {
      if (passwordWrite) {
        login(user);
        setError("");
        setLoggedIn(true);
      } else {
        setError("Contraseña incorrecta");
      }
    } else {
      setError("Usuario no encontrado");
    }
  };

  if (loggedIn) {
    return  <Redirect to="/home" />;
  }
  return (
    <div className="login-page">
      <div className="sidebar-login bg-blue only-desk">
        <img src={line} alt="line" className="p-absolute sidebar-line" />
        <div className="bg-blue p-relative">
          <img src={logo} alt="Logo" />
        </div>
        <div className="bg-blue p-relative">
          <h1>Bienvenidos</h1>
          <h3>por favor inicia sesión para continuar</h3>
        </div>
      </div>
      <div className="content-login">
        <div className="bg-blue p-relative only-mobile">
          <img src={logo} alt="Logo" />
        </div>
        <h1 className="blue">Sign in</h1>
        <div className="form">
          <input
            type="email"
            value={username}
            placeholder="Tu correo electrónico"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin} className="bg-green">
            Continuar
          </button>
          {error && <p>{error}</p>}
        </div>
      </div>
    </div>
  );
}
