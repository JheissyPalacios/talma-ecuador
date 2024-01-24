import React, { useEffect, useState } from 'react';

const InactividadManager = ({ onInactividad }) => {
  const [inactivo, setInactivo] = useState(false);

  useEffect(() => {
    let inactividadTimer;

    const restablecerInactividad = () => {
      clearTimeout(inactividadTimer);
      setInactivo(false);

      // Reinicia el temporizador de inactividad cada vez que haya actividad del usuario
      inactividadTimer = setTimeout(() => {
        setInactivo(true);
        onInactividad();
      }, 5 * 60 * 100000); // 5 minutos en milisegundos
    };

    // Agrega event listeners para rastrear la actividad del usuario
    window.addEventListener('mousemove', restablecerInactividad);
    window.addEventListener('keydown', restablecerInactividad);

    // Inicia el temporizador de inactividad cuando se monta el componente
    restablecerInactividad();

    // Limpia los event listeners al desmontar el componente
    return () => {
      window.removeEventListener('mousemove', restablecerInactividad);
      window.removeEventListener('keydown', restablecerInactividad);
      clearTimeout(inactividadTimer);
    };
  }, [onInactividad]);

  return <div>{inactivo && '¡Te has desconectado por inactividad!'}</div>;
};

export default InactividadManager;
