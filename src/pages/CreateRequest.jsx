import React, { useState, useEffect, useRef } from "react";
import subir from "../images/subir.svg";
import { useUser } from "../AppProvider";
// eslint-disable-next-line no-unused-vars
import emailjs from "emailjs-com";
import { collection, addDoc, query, orderBy, where, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db, uploadFile, storage } from "../firebase/config";
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import Loader from "./Loader";
import ojo from "../images/ojo.svg";

export default function CreateRequest() {
  //----------------------------------------------
  //----------------CONSTANTES--------------------
  //----------------------------------------------
  //useUser es el localStorage donde está la información del usuario
  const { user, logout } = useUser();

  //isVisible es lo que oculta y muestra los filtros de shift_filter
  const [isVisible, setIsVisible] = useState(false);

  //loading hace que abra o cierre el cargador
  const [loading, setLoading] = useState(false);

  //Lista de datos predefinidos guardados por el usuario
  const [listPredef, setListPredef] = useState(false)

  //Aca se almacenan los datos de la base de datos firebase
  const [data, setData] = useState([]);

  //Todos los datos del formulario
  const [formularioData, setFormData] = useState({
    capacity: null,
    num_weeks: "",
    shift_filter: false,
    madrugada: 0,
    dia: 0,
    tarde: 0,
    noche: 0,
    sinluz: 0,
    rest_time_hours: "",
    people: null,
    initial_rest_periods: null,
    last_shifts: null,
    objective: "",
    name_consult: "",
    dateInit: "",
    idDB: ""
  });

  //Array de errores de del fomulario del usuario
  const [errors, setErrors] = useState({
    num_weeks: "",
    madrugada: "",
    dia: "",
    tarde: "",
    noche: "",
    sinluz: "",
    rest_time_hours: "",
    capacity: "",
    csvGroup: "",
    name_consult: "",
    objective: ""
  });

  //Donde se almacena el largo de cada documento que deberían ser iguales
  const [lengthCSV, setlengthCSV] = useState({
    people: "",
    initial_rest_periods: "",
    last_shifts: "",
  });

  //Valida que haya algun error para mostrar mensaje de error global y cambiar el color de los input
  const errores = !!errors.csvGroup || !!errors.capacity || !!errors.rest_time_hours || !!errors.noche || !!errors.sinluz || !!errors.tarde || !!errors.dia || !!errors.num_weeks || !!errors.madrugada

  //Valida que NO haya ningun error para poder envíar el formulario
  const noErrors = !errors.csvGroup && !errors.capacity && !errors.rest_time_hours && !errors.noche && !errors.sinluz && !errors.tarde &&  !errors.objective && !errors.dia && !errors.num_weeks && !errors.madrugada
  
  //Valida que NO haya ningun campo vacio para poder envíar el formulario y bloquea el botón de envíar tambien
  const noEmpty = formularioData.people === null || formularioData.initial_rest_periods === null || formularioData.last_shifts === null || formularioData.capacity === null || formularioData.rest_time_hours === "" || formularioData.num_weeks === "" || formularioData.name_consult === "" || formularioData.objective === ""
  
  //Valida que TODOS los campos estén vacios para activar o desactivar el botón de guardar predeterminado
  const empty = formularioData.people === null && formularioData.initial_rest_periods === null && formularioData.last_shifts === null && formularioData.capacity === null && formularioData.rest_time_hours === "" && formularioData.num_weeks === "" && formularioData.name_consult === "" && formularioData.objective === ""




  //----------------------------------------------
  //-----------------FUNCIONES--------------------
  //----------------------------------------------

  //Abrir o cerrar el modal de "Busquedas predefinidas"
  const openModalListPredef = () => { 
    setListPredef(true);
    document.body.style.overflow = 'hidden';
  };
  const closeModalListPredef = () => {
    setListPredef(false);
    document.body.style.overflow = 'auto';
  };

  //Valida el largo de los csv de people, rest y last time para mostrar el mensaje de error
  useEffect(() => {
    validatecsvGroup()
  }, [lengthCSV])
  
  //Trae los datos de "Busquedas predeterminadas de la DB
  useEffect(() => {
    setLoading(true)
    document.body.style.overflow = 'hidden';
    const listSolicitudes = collection(db, "solicitudes");

    if (listSolicitudes && user.username) {
      //const queryRef = query(listSolicitudes, where("user", "==", user.username), where("dbName", "==", "pred"));
      const queryRef = query(
        listSolicitudes,
        where("user", "==", user.username),
        where("dbName", "==", "pred"),  // Agrega tus condiciones de filtro
        //orderBy("dateInit")
      );
      
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
    } else {
      logout()
    }
  }, []);

  // Efecto para limpiar los errores cuando el componente se carga o actualiza
  useEffect(() => {
    setErrors({
      ...errors,
      num_weeks: "",
      madrugada: "",
      dia: "",
      tarde: "",
      noche: "",
      sinluz: "",
      rest_time_hours: "",
      capacity: "",
      csvGroup: "",
      objective: ""
    });
  }, []); 
  
  //Funcion que guarda los datos de todos los campos del formulario
  const handleInputChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (type === "checkbox") {
      // Si es un checkbox, usamos 'checked' para el valor booleano
      setIsVisible(!isVisible);
      setFormData({
        ...formularioData,
        [name]: checked,
      });
      if (checked === false) {
        setFormData({
          ...formularioData,
          madrugada: 0,
          dia: 0,
          tarde: 0,
          noche: 0,
          sinluz: 0
        });
      }
    } else if (
      name === "madrugada" ||
      name === "dia" ||
      name === "tarde" ||
      name === "noche" ||
      name === "sinluz"
    ) {
      const numero = parseFloat(value);

      if (!isNaN(numero) && numero >= 1 && numero <= 5) {
        setErrors({ ...errors, [name]: "" });
        setFormData({
          ...formularioData,
          [name]: numero,
        });
      } else {
        setErrors({ ...errors, [name]: "El número debe estar entre 1 y 5" });
      }
    } else if (name === "num_weeks") {
      const numero = parseFloat(value);

      if (!isNaN(numero) && numero >= 1 && numero <= 10) {
        setErrors({ ...errors, num_weeks: "" });
        setFormData({
          ...formularioData,
          num_weeks: numero,
        });
      } else {
        setErrors({
          ...errors,
          num_weeks: "El número debe estar entre 1 y 10",
        });
      }
    } else if (name === "rest_time_hours") {
      const numero = parseFloat(value);

      if (!isNaN(numero) && numero >= 1 && numero <= 100) {
        setErrors({ ...errors, rest_time_hours: "" });
        setFormData({
          ...formularioData,
          rest_time_hours: numero,
        });
      } else {
        setErrors({
          ...errors,
          rest_time_hours: "El número debe estar entre 1 y 100",
        });
      }
    } else if (
      name === "capacity" ||
      name === "people" ||
      name === "initial_rest_periods" ||
      name === "last_shifts"
    ) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvContent = event.target.result;
        // Llamar a una función para analizar el contenido del archivo CSV
        parseCSVContent(csvContent, name, file);
      };
      console.log(file);
      if (file !== undefined){
        reader.readAsText(file);
      }
    } else {
      setFormData({
        ...formularioData,
        [name]: value,
      });
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const parseCSVContent = (csvContent, name, file) => {
    // Dividir el contenido del CSV en filas
    const rows = csvContent.split("\n");
    const numRows = rows.length;
    // Contar las columnas en la primera fila (asumiendo que todas las filas tienen la misma cantidad de columnas)
    const firstRow = rows[0].split(";");
    const numColumns = firstRow.length;

    if (name === "capacity") {
      if (numRows !== 48 || numColumns !== 7) {
        setErrors({
          ...errors,
          capacity: "El archivo no tiene el tamaño 48x7",
        });
      } else {
        setErrors({
          ...errors,
          capacity: "",
        });
        setFormData({
          ...formularioData,
          [name]: file,
        });
      }
    }

    if (
      name === "people" ||
      name === "initial_rest_periods" ||
      name === "last_shifts"
    ) {
      setlengthCSV({
        ...lengthCSV,
        [name]: `${numRows}`,
      });
      setFormData({
        ...formularioData,
        [name]: file,
      });
    }
  };

  const guardarInDB = async (nameDB, fechaHoy) => {
    setLoading(true);
    document.body.style.overflow = 'hidden';
    var capacityFirebase
    var peopleFirebase
    var initialFirebase
    var lastFirebase
    var msgSave

    if (nameDB === 'cons') {
       capacityFirebase = await uploadFile(formularioData?.capacity);
       peopleFirebase = await uploadFile(formularioData?.people);
       initialFirebase = await uploadFile(formularioData?.initial_rest_periods);
       lastFirebase = await uploadFile(formularioData?.last_shifts);
       msgSave = 'Se han guardado tus datos correctamente, se le notificará a su correo electrónico cuando su consulta haya finalizado';
    } else {
       capacityFirebase = "";
       peopleFirebase = "";
       initialFirebase = "";
       lastFirebase = "";
       msgSave = 'Se han guardado tus datos correctamente';
    }
    
      
    var ID

    const addSolicitudDB = {
      name_consult: formularioData.name_consult,
      num_weeks: formularioData.num_weeks,
      shift_filter: formularioData.shift_filter === false ? 'False' : 'True',
      objective: formularioData.objective,
      madrugada: formularioData.madrugada,
      dia: formularioData.dia,
      tarde: formularioData.tarde,
      noche: formularioData.noche,
      sinluz: formularioData.sinluz,
      rest_time_hours: formularioData.rest_time_hours,
      capacity: capacityFirebase,
      people: peopleFirebase,
      initial_rest_periods: initialFirebase,
      last_shifts: lastFirebase,
      dateInit: fechaHoy,
      user: user.username,
      nombre: user.nombre,
      dbName: nameDB,
      state: 3,
      roster: "",
      error: ""
   };
   
   const solicitudesRef = collection(db, "solicitudes");
   await addDoc(solicitudesRef, addSolicitudDB)
     .then((response) => {
        alert(msgSave);
        ID = response.id
        return ID; // Retorna el ID
     })
     .catch((e) => {
       console.error(e);
       alert("Error datos no guardados");
       ID = null
       return ID; // Retorna el ID
     })
     setLoading(false);
     document.body.style.overflow = 'auto';

    return ID;
  }

  const handleGuardarUsuario = () => {
    const nameDB = 'pred'
    const fechaHoy = obtenerFechaActual();
    console.log(!empty);
    if (!empty) {
      guardarInDB(nameDB, fechaHoy)
    } else {
      alert("Ingresa los datos que deseas guardar como predefinidos")
    }
  };

  const dataPredeterminada = (element) => {
    setLoading(true)
    document.body.style.overflow = 'hidden';

    console.log(element);
        
    setFormData({ 
      ...formularioData, 
  //   capacity: capacityFirebase,
      num_weeks: element?.num_weeks,
      madrugada: element?.madrugada,
      dia: element?.dia,
      tarde: element?.tarde,
      noche: element?.noche,
      sinluz: element?.sinluz,
      rest_time_hours: element?.rest_time_hours,
  //   people: peopleFirebase,
  //   initial_rest_periods: initialFirebase,
  //   last_shifts: lastFirebase,
      objective: element?.objective,
      name_consult: element?.name_consult,
      shift_filter: element?.shift_filter === 'False' ? false : true,
    })
    
    setIsVisible(element?.shift_filter === 'False' ? false : true)

    setLoading(false)
    document.body.style.overflow = 'auto';
    closeModalListPredef()
  }

  const validatecsvGroup = () => {
    if(lengthCSV.people && lengthCSV.last_shifts && lengthCSV.initial_rest_periods) {
      if (lengthCSV.people === lengthCSV.last_shifts && lengthCSV.people === lengthCSV.initial_rest_periods) {
        setErrors({
          ...errors,
          csvGroup: "",
        });
      } else {
        setErrors({
          ...errors,
          csvGroup: "Los archivos no tienen el mismo tamaño",
        });
      }
    }
  };

  const sendEmail = async (idDocumento) => {

    const docRef = doc(db, 'solicitudes', idDocumento.toString());
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const referenciaDocumento = docSnap.data();
      
      const addSolicitudDB = {
        name_consult: referenciaDocumento?.name_consult,
        num_weeks: referenciaDocumento?.num_weeks,
        shift_filter: referenciaDocumento?.shift_filter,
        objective: referenciaDocumento?.objective,
        madrugada: referenciaDocumento?.madrugada,
        dia: referenciaDocumento?.dia,
        tarde: referenciaDocumento?.tarde,
        noche: referenciaDocumento?.noche,
        sinluz: referenciaDocumento?.sinluz,
        rest_time_hours: referenciaDocumento?.rest_time_hours,
        capacity: referenciaDocumento?.capacity,
        people: referenciaDocumento?.people,
        initial_rest_periods: referenciaDocumento?.initial_rest_periods,
        last_shifts: referenciaDocumento?.last_shifts,
        dateInit: referenciaDocumento?.dateInit,
        dateFinish: referenciaDocumento?.dateFinish,
        roster: referenciaDocumento?.roster,
        state: referenciaDocumento?.state === 1 ? 'terminado' : '',
     };


     console.log("ENVIAR CORREO");
     console.log(addSolicitudDB);


     // Replace 'your_email_template_id' with your Email.js email template ID
     const templateParams = {
       //to_email: user.username,
       to_email: 'jheissyp@gmail.com',
       subject: 'Su consulta en Talma ha llegado a su fin',
       message: addSolicitudDB,
       to_name: user.nombre
     };

     emailjs.send('service_qv0eipf', 'template_cylzq9r', templateParams, "XH03JWoSXh73Px0Pa")
       .then((response) => {
         console.log('Correo electrónico enviado con éxito:', response);
       })
       .catch((error) => {
         console.error('Error al enviar el correo electrónico:', error);
       });
    }

  };

  const actualizarDocumento = async (db, nombreColeccion, idDocumento, nuevosDatos) => {
    const referenciaDocumento = doc(db, nombreColeccion, idDocumento);
    
    try {
        await setDoc(referenciaDocumento, nuevosDatos, { merge: true });
        console.log('Documento actualizado correctamente.', nuevosDatos);
    } catch (error) {
        console.error('Error al actualizar el documento:', error);
    }
  };

  const guardarEnArchivoTemporal = async (roster, id) => {
    var urlTemp;
    const nombreArchivoTemporal = 'roster2.csv';

    // Crear contenido CSV
    const csvContent = Object.entries(roster)
      .map(([key, value]) => `${key}, ${value}`)
      .join('\n');

    // Crear Blob
    const blob = new Blob([csvContent], { type: 'text/csv' });

    // Crear URL del Blob
    const url = URL.createObjectURL(blob);

      // Crear enlace de descarga temporal
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivoTemporal;
    // Adjuntar el enlace al documento y simular clic
    document.body.appendChild(a);
    a.click();

    //Liberar recursos después de un breve tiempo
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 1000);

   const storageRef = ref(storage, `archivos/${nombreArchivoTemporal}`);
 
    // Sube el contenido del archivo temporal a Storage
    uploadString(storageRef, csvContent);
    urlTemp = await getDownloadURL(storageRef);
    await actualizarDocumento(db, 'solicitudes', id,  {roster: urlTemp})
    await sendEmail(id)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (noErrors && !noEmpty) {
      const fechaHoy = obtenerFechaActual();
      const idGenerado = await guardarInDB("cons", fechaHoy);
      setFormData({ 
        ...formularioData, 
        dateInit: fechaHoy
      })
      
      const formData = new FormData();
      formData.append('name_consult', formularioData.name_consult);
      formData.append('num_weeks', formularioData.num_weeks);
      formData.append('shift_filter', formularioData.shift_filter === false ? 'False' : 'True');
      formData.append('madrugada', formularioData.madrugada);
      formData.append('dia', formularioData.dia);
      formData.append('tarde', formularioData.tarde);
      formData.append('noche', formularioData.noche);
      formData.append('sinluz', formularioData.sinluz);
      formData.append('rest_time_hours', formularioData.rest_time_hours);
      formData.append('objective', formularioData.objective);
      formData.append('capacity', formularioData.capacity);
      formData.append('people', formularioData.people);
      formData.append('initial_rest_periods', formularioData.initial_rest_periods);
      formData.append('last_shifts', formularioData.last_shifts);
      formData.append('fecha', fechaHoy);
      formData.append('idDB', idGenerado.toString());
      formData.append('username', user.username);
      formData.append('nombre', user.nombre);
      
      try {
        const response = await fetch(
          `http://localhost:8000/crear_consulta`,
          {
            method: "POST",
            body: formData,
            redirect: 'follow'
          }
        );
        
        const data = await response.json();
      

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

      } catch (error) {
        console.error("Error al enviar la solicitud:", error.toString());
      }
    }
  };

  const obtenerFechaActual = () => {
    const fechaActual = new Date();
    // Obtener componentes de la fecha
    const dia = fechaActual.getDate() <= 9 ? `0${fechaActual.getDate()}` : fechaActual.getDate();
    const mes = (fechaActual.getMonth() + 1 )<= 9 ? `0${(fechaActual.getMonth() + 1)}` : (fechaActual.getMonth() + 1);
    const anio = fechaActual.getFullYear();
    let hora = fechaActual.getHours();
    const minutos = fechaActual.getMinutes() <= 9 ? `0${fechaActual.getMinutes()}` : fechaActual.getMinutes();
    const segundos = fechaActual.getSeconds() <= 9 ? `0${fechaActual.getSeconds()}` : fechaActual.getSeconds();

    const periodo = hora >= 12 ? "PM" : "AM";
    // Convertir la hora al formato de 12 horas
    hora = (hora % 12 || 12)  <= 9 ? `0${hora % 12 || 12}` : hora % 12 || 12;
    // Formatear la fecha y hora
    const fechaFormateada = `${anio}/${mes}/${dia} ${hora}:${minutos}:${segundos} ${periodo}`;
    return fechaFormateada;
  };

  return (
    <div className="container">
      <h1 className="blue">
        Crear solicitud{" "}
        <span onClick={openModalListPredef} className="green buton-title text">
          Busquedas predefinidas
        </span>{" "}
        <span onClick={handleGuardarUsuario} className="green buton-title">
          Guardar busqueda
        </span>{" "}
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="form">
          <div>
            <div
              className="input btn-file container-input"
              style={{ borderColor: errors.capacity ? "red" : "initial" }}
            >
              <span className="name-button-file">Capacidad</span>
              <img src={subir} alt="subir" />
              <input
                type="file"
                id="capacity"
                name="capacity"
                onChange={handleInputChange}
                accept=".csv"
                
              />
            </div>
            {errors?.capacity && (
              <p className="error-input-text">{errors?.capacity}</p>
            )}
          </div>
          <div className="two-columns">
            <div className="container-input">
              <input
                type="number"
                id="num_weeks"
                name="num_weeks"
                onChange={handleInputChange}
                placeholder="Cantidad de semanas"
                min="1"
                max="10"
                value={formularioData.num_weeks || ''}
                style={{ borderColor: errors.num_weeks ? "red" : "initial" }}
                
              />
              {errors.num_weeks && (
                <p className="error-input-text">{errors.num_weeks}</p>
              )}
            </div>
            <div className="input-label">
              Filtro de turnos
              <label className="switch">
                <input
                  type="checkbox"
                  id="shift_filter"
                  name="shift_filter"
                  checked={formularioData.shift_filter}
                  onChange={handleInputChange}
                  
                />
                <span className={isVisible === true ? "slider round active" : "slider round" }></span>
              </label>
            </div>
          </div>
          {isVisible && (
            <div>
              <div className="three-columns">
                <div className="container-input">
                  <input
                    type="number"
                    id="madrugada"
                    name="madrugada"
                    onChange={handleInputChange}
                    placeholder="Madrugada"
                    min="1"
                    max="5"
                    value={formularioData.madrugada || ''}
                    style={{
                      borderColor: errors.madrugada ? "red" : "initial",
                    }}
                  />
                  {errors.madrugada && (
                    <p className="error-input-text">{errors.madrugada}</p>
                  )}
                </div>
                <div className="container-input">
                  <input
                    type="number"
                    id="dia"
                    name="dia"
                    onChange={handleInputChange}
                    placeholder="Día"
                    min="1"
                    max="5"
                    value={formularioData.dia || ''}
                    style={{ borderColor: errors.dia ? "red" : "initial" }}
                  />
                  {errors.dia && (
                    <p className="error-input-text">{errors.dia}</p>
                  )}
                </div>
                <div className="container-input">
                  <input
                    type="number"
                    id="tarde"
                    name="tarde"
                    onChange={handleInputChange}
                    placeholder="Tarde"
                    min="1"
                    max="5"
                    value={formularioData.tarde || ''}
                    style={{ borderColor: errors.tarde ? "red" : "initial" }}
                  />
                  {errors.tarde && (
                    <p className="error-input-text">{errors.tarde}</p>
                  )}
                </div>
              </div>
              <div className="two-columns">
                <div className="container-input">
                  <input
                    type="number"
                    id="noche"
                    name="noche"
                    onChange={handleInputChange}
                    placeholder="Noche"
                    min="1"
                    max="5"
                    value={formularioData.noche || ''}
                    style={{ borderColor: errors.noche ? "red" : "initial" }}
                  />
                  {errors.noche && (
                    <p className="error-input-text">{errors.noche}</p>
                  )}
                </div>
                <div className="container-input">
                  <input
                    type="number"
                    id="sinluz"
                    name="sinluz"
                    onChange={handleInputChange}
                    placeholder="Sin luz"
                    min="1"
                    max="5"
                    style={{ borderColor: errors.sinluz ? "red" : "initial" }}
                    value={formularioData.sinluz || ''}
                  />
                  {errors.sinluz && (
                    <p className="error-input-text">{errors.sinluz}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="container-input">
            <input
              type="number"
              id="rest_time_hours"
              name="rest_time_hours"
              onChange={handleInputChange}
              placeholder="Descanso largo"
              min="1"
              max="100"
              style={{
                borderColor: errors.rest_time_hours ? "red" : "initial",
              }}
              value={formularioData.rest_time_hours || ''}
              
            />
            {errors.rest_time_hours && (
              <p className="error-input-text">{errors.rest_time_hours}</p>
            )}
          </div>
          <div>
            <div
              className="input btn-file container-input"
              style={{ borderColor: errors.csvGroup ? "red" : "initial" }}
            >
              <span className="name-button-file">Personas</span>
              <img src={subir} alt="subir" />
              <input
                type="file"
                id="people"
                name="people"
                onChange={handleInputChange}
                accept=".csv"
                
              />
            </div>
            {errors.csvGroup && (
              <p className="error-input-text">
                {errors.csvGroup} (este archivo tiene {lengthCSV.people})
              </p>
            )}
          </div>
          <div>
            <div
              className="input btn-file container-input"
              style={{ borderColor: errors.csvGroup ? "red" : "initial" }}
            >
              <span className="name-button-file">
                Periodos de descanso anteriores
              </span>
              <img src={subir} alt="subir" />
              <input
                type="file"
                id="initial_rest_periods"
                name="initial_rest_periods"
                onChange={handleInputChange}
                accept=".csv"
                
              />
            </div>
            {errors.csvGroup && (
              <p className="error-input-text">
                {errors.csvGroup} (este archivo tiene{" "}
                {lengthCSV.initial_rest_periods})
              </p>
            )}
          </div>
          <div>
            <div
              className="input btn-file container-input"
              style={{ borderColor: errors.csvGroup ? "red" : "initial" }}
            >
              <span className="name-button-file">Último turno</span>
              <img src={subir} alt="subir" />
              <input
                type="file"
                id="last_shifts"
                name="last_shifts"
                onChange={handleInputChange}
                accept=".csv"
                
              />
            </div>
            {errors.csvGroup && (
              <p className="error-input-text">
                {errors.csvGroup} (este archivo tiene {lengthCSV.last_shifts})
              </p>
            )}
          </div>
          <select
            id="objective"
            name="objective"
            onChange={handleInputChange}
            value={formularioData.objective || ""}
            style={{ borderColor: !noEmpty && !errores && formularioData.objective === "" ? "red" : "initial" }}
          >
            <option value="" disabled selected hidden>
              Objetivo
            </option>
            <option value="Balanced">Balanced</option>
            <option value="Min">Min</option>
          </select>
          <div className="container-input">
            <input
              type="text"
              id="name_consult"
              value={formularioData.name_consult || ''}
              name="name_consult"
              onChange={handleInputChange}
              placeholder="Nombre para la consulta"
              
            />
          </div>
          <div>
            {errors.name_consult && (
              <p className="error-input-text">{errors.name_consult}</p>
            )}
            {errores && (
              <p className="error-input-text general">
                Por favor, corrija los errores antes de enviar el formulario.
              </p>
            )}
            {noEmpty && !errores && (
              <p className="error-input-text general">
                Por favor, llene todos los campos antes de enviar el formulario.
              </p>
            )}
            <button
              type="submit"
              className="bg-green"
              style={{ backgroundColor: errores || noEmpty? "lightgray" : "#88B13B" }}
              onClick={handleSubmit}
              disabled={errores || noEmpty}
            >
              Crear solicitud
            </button>
          </div>
        </div>
      </form>
      
      {loading === true && <Loader/>}
      { listPredef &&
          (<div className="modal_predefinidas">
            <div className="modal_predefinidas_containers bg-white">
              <h1 className="blue">Datos para busquedas predefinidas</h1>
              <p onClick={closeModalListPredef} className="cursorPointer close-modal">X</p>
              <ul className="">
                {data.length > 0 &&
                  data.map((element, index) => (
                    <li key={index}>
                      <p>
                        Nombre de la solicitud: <small>{JSON.stringify(element?.name_consult)}</small>
                      </p>
                      <small className="dateModalPred">{element?.fecha}</small>
                      <img
                        src={ojo}
                        alt="Ver más"
                        onClick={() => dataPredeterminada(element)}
                        className="cursorPointer"
                        />
                    </li>
                  ))
                }

                {data.length === 0 &&
                  <p style={{textAlign : 'center'}}>
                    Aún no has guardado ningun registro.
                  </p>
                }
              </ul>
            </div>
          </div>)
      }
    </div>
  );
}
