import React, { useState, useEffect } from "react";
import ojo from "../images/ojo.svg";
import subir from "../images/subir.svg";
import { db } from "../firebase/config";
import { collection, query, orderBy, where, getDocs } from "firebase/firestore";
import { useUser } from "../AppProvider";
import Loader from "./Loader";

export default function Requests() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [solicitud, setSolicitud] = useState();

  const setSolicitud2 = (element) => {
    setSolicitud(element)
    console.log(element);
  }
  useEffect(() => {
    setLoading(true)
    document.body.style.overflow = 'hidden';
    const listSolicitudes = collection(db, "solicitudes");
    console.log(listSolicitudes);
    const queryRef = query(listSolicitudes, where("user", "==", user.username), where("dbName", "==", "cons"));

    getDocs(queryRef)
      .then((resp) => {
        return resp?.docs.map((doc) => {
          return { ...doc.data(), id: doc.id };
        });
      })
      .then((dat) => {
        setData(dat);
        setLoading(false)
        document.body.style.overflow = 'auto';
      });
  }, [user]);

  const filterState = (state) => {
    if (state === 1) {
      return <span className="status-green">Terminada</span>;
    } else if (state === 2) {
      return <span className="status-red">Fallida</span>;
    } else {
      return <span className="status-yellow">Pendiente</span>;
    }
  };

  const abrirURL = (url) => {
    window.open(url, "_blank"); // '_blank' abre la URL en una nueva pestaña o ventana
  };
  return (
    <div className="container solicitudes">
      <h1 className="blue">Solicitudes</h1>
      <ul>
        {data.length > 0 &&
          data.map((element, index) => (
            <li key={index}>
              <p>
                Nombre de la solicitud: <small>{JSON.stringify(element?.name_consult)}</small>
              </p>
              <div className="align-center">{filterState(element?.state)}</div>
              <img
                src={ojo}
                alt="Ver más"
                onClick={() => setSolicitud2(element)}
                className="cursorPointer"
                />
                {solicitud && (
                  <div className="container modal-request bg-white">
                    <h1 className="blue">
                      Nombre de la solicitud: <span className="name_request blue">{solicitud?.name_consult}</span>
                      <div className="align-center">{filterState(solicitud?.state)}</div>
                    </h1>
                    <div className="two-columns margin-top">
                      <p>
                        Capacidad{" "}
                        {solicitud?.capacity &&
                          <span
                            className="green"
                            onClick={() => abrirURL(solicitud?.capacity)}
                          >
                            Ver CVG
                          </span>
                        }
                      </p>
                      <p>
                        Cantidad de semanas: <b> {solicitud?.num_weeks}</b>
                      </p>
                      <p>
                        Filtro de turnos: <b> {solicitud?.shift_filter}</b>
                      </p>
                      <p>
                        Madrugada: <b> {solicitud?.madrugada}</b>
                      </p>
                      <p>
                        Día: <b> {solicitud?.dia}</b>
                      </p>
                      <p>
                        Tarde: <b> {solicitud?.tarde}</b>
                      </p>
                      <p>
                        Noche: <b> {solicitud?.noche}</b>
                      </p>
                      <p>
                        Sin luz: <b> {solicitud?.sinluz}</b>
                      </p>
                      <p>
                        Descanso largo: <b> {solicitud?.rest_time_hours}</b>
                      </p>
                      <p>
                        Personas{" "}
                        {solicitud?.people &&
                          <span
                            className="green"
                            onClick={() => abrirURL(solicitud?.people)}
                          >
                            Ver CVG
                          </span>
                        }
                      </p>
                      <p className="long-text">
                        Periodos de descanso anteriores{" "}
                        {solicitud?.initial_rest_periods &&
                          <span
                            className="green"
                            onClick={() => abrirURL(solicitud?.initial_rest_periods)}
                          >
                            Ver CVG
                          </span>
                        }
                      </p>
                      <p className="long-text">
                        Periodos de descanso Último turno{" "}
                        {solicitud?.last_shifts &&
                          <span
                            className="green"
                            onClick={() => abrirURL(solicitud?.last_shifts)}
                          >
                            Ver CVG
                          </span>
                        }
                      </p>
                      <p>
                        Objetivo: <b> {solicitud?.objective}</b>
                      </p>
                      <p>
                        Fecha inicio: <b> {solicitud?.dateInit} </b>
                      </p>
                      {solicitud?.dateFinish &&
                      <p>
                        Fecha final: <b> {solicitud?.dateFinish} </b>
                      </p>
                      }
                      {solicitud?.state === 2 && solicitud?.error &&
                      <p>
                        Error: <b> {solicitud?.error} </b>
                      </p>
                      }
                    </div>
                    <div className="two-columns">
                      <button className="bg-blue" onClick={() => setSolicitud("")}>
                        Regresar
                      </button>
                      <button
                        className="bg-green buton-icon"
                        onClick={() => abrirURL(solicitud?.roster)}
                        style={{ backgroundColor: solicitud?.state !== 1 ? "lightgray" : "#88B13B" }}
                        disabled={solicitud?.state !== 1}
                      >
                        Descargar CVG <img src={subir} alt="subir" />{" "}
                      </button>
                    </div>
                  </div>
                )}
            </li>
          ))}


      </ul>
      
      {loading && <Loader/>}
    </div>
  );
}
