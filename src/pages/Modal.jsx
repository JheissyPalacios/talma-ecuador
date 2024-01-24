import React from 'react'

export default function Modal() {
  return (
    <div className="container modal-request bg-white">
        <h1 className="blue">Nombre de la solicitud #1 <span className="status-red">Fallida</span></h1>
        <div className="two-columns">
            <p>Capacidad: <b>2</b></p>
            <p>Cantidad de semanas: <b>2</b></p>
            <p>Filtro de turnos: <b>true</b></p>
            <p>Madrugada: <b>2</b></p>
            <p>Día: <b>2</b></p>
            <p>Tarde: <b>2</b></p>
            <p>Noche: <b>2</b></p>
            <p>Sin luz: <b>2</b></p>
            <p>Descanso largo: <b>2</b></p>
            <p>Personas: <b>2</b></p>
            <p>Periodos de descanso anteriores: <b>2</b></p>
            <p>Periodos de descanso Último turno: <b>2</b></p>

        </div>
        <div className="two-columns">
            <button className="bg-blue" onClick={toggleVisibility}>Regresar</button>
            <button className="bg-green">Descargar CVG</button>
        </div>
    </div>
  )
}
