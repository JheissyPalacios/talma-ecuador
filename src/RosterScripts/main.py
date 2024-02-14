from fastapi import FastAPI, Form, File, UploadFile, status, Depends, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from fastapi.responses import JSONResponse
import numpy as np
from MonthWrapperV2 import month_rosterV2
from Firebase import actualizar_documento, upload_file, view_documento
import os
from datetime import datetime
from csv import reader
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def enviar_correo(destinatario, asunto, cuerpo):
    # Configura los detalles del remitente y del servidor SMTP
    remitente = 'ingpalaciosmarchan@gmail.com'
    servidor_smtp = 'smtp.gmail.com'
    puerto_smtp = 587

    # Construye el mensaje
    mensaje = MIMEMultipart()
    mensaje['From'] = remitente
    mensaje['To'] = destinatario
    mensaje['Subject'] = asunto

    # Cuerpo del mensaje en HTML
    html = """
        <html>
            <body>
                <h3>Hola <strong>[nombre]</strong></h3>
                <p>Ha terminado tu consulta "[name_consult]" con los siguientes parametros:</p>
                
                <ul>
                    <li>Fecha de inicio: [dateInit]</li>
                    <li>Capacidad: <a href=[capacity]> Descargar archivo CSV </a></li>
                    <li>Cantidad de semanas: [num_weeks]</li>
                    <li>Filtro de turnos: [shift_filter]</li>
                    <li>Madrugada: [madrugada]</li>
                    <li>Día: [dia]</li>
                    <li>Tarde: [tarde]</li>
                    <li>Noche: [noche]</li>
                    <li>Sin luz: [sinluz]</li>
                    <li>Descanso largo: [rest_time_hours]</li>
                    <li>Personas: <a href=[people]> Descargar archivo CSV </a></li>
                    <li>Periodos de descanso anteriores: <a href=[initial_rest_periods]> Descargar archivo CSV </a></li>
                    <li>Último turno: <a href=[last_shifts]> Descargar archivo CSV </a></li>
                    <li>Objetivo: [objective]</li>
                    <li>Fecha de finalización: [dateFinish]</li>
                </ul>

                <p><a href=[roster]> Roster.csv </a></p>

                <p>Si quieres más información te recomiendo visitar nuestro sistema.<br>
                    Talma.
                </p>
            </body>
        </html>
    """

    html = html.replace('[nombre]', cuerpo['nombre'])
    html = html.replace('[name_consult]', cuerpo['name_consult'])
    html = html.replace('[objective]', cuerpo['objective'])
    html = html.replace('[last_shifts]', cuerpo['last_shifts'])
    html = html.replace('[dateInit]', cuerpo['dateInit'])
    html = html.replace('[dateFinish]', cuerpo['dateFinish'])
    html = html.replace('[shift_filter]', cuerpo['shift_filter'])
    html = html.replace('[madrugada]', str(cuerpo['madrugada']))
    html = html.replace('[dia]', str(cuerpo['dia']))
    html = html.replace('[tarde]', str(cuerpo['tarde']))
    html = html.replace('[noche]', str(cuerpo['noche']))
    html = html.replace('[sinluz]', str(cuerpo['sinluz']))
    html = html.replace('[num_weeks]', str(cuerpo['num_weeks']))
    html = html.replace('[rest_time_hours]', str(cuerpo['rest_time_hours']))
    html = html.replace('[capacity]', cuerpo['capacity'])
    html = html.replace('[people]', cuerpo['people'])
    html = html.replace('[initial_rest_periods]', cuerpo['initial_rest_periods'])
    html = html.replace('[roster]', cuerpo['roster'])


    # Agrega el cuerpo del mensaje
    mensaje.attach(MIMEText(html, 'html'))

    # Configura la conexión SMTP
    servidor = smtplib.SMTP(servidor_smtp, puerto_smtp)
    servidor.starttls()

    # Inicia sesión en la cuenta del remitente
    servidor.login(remitente, "comp kbyb edhh usjn")

    # Envía el correo electrónico
    servidor.sendmail(remitente, destinatario, mensaje.as_string())
    print("Se envió el correo electrónico")
    # Cierra la conexión SMTP
    servidor.quit()


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.post("/crear_consulta")
async def crear_consulta(
    capacity: UploadFile = File(...),
    people: UploadFile = File(...),
    initial_rest_periods: UploadFile = File(...),
    last_shifts: UploadFile = File(...),
    num_weeks: int = Form(...),
    shift_filter: bool = Form(...),
    madrugada: int = Form(...),
    dia: int = Form(...),
    tarde: int = Form(...),
    noche: int = Form(...),
    sinluz: int = Form(...),
    rest_time_hours: int = Form(...),
    objective: str = Form(...),
    idDB: str = Form(...)
 ):
    try:
        now = datetime.now()
        ts = datetime.timestamp(now)
        view_documento(idDB)
        def save_file_at_dir(dir_path, filename, file_content, mode='wb'):
            os.makedirs(dir_path, exist_ok=True)
            with open(os.path.join(dir_path, filename), mode) as f:
                f.write(file_content.file.read())
                
        save_file_at_dir('filesDB/' + str(ts), 'capacity.csv', capacity)
        save_file_at_dir('filesDB/' + str(ts), 'people.csv', people)
        save_file_at_dir('filesDB/' + str(ts), 'initial_rest_periods.csv', initial_rest_periods)
        save_file_at_dir('filesDB/' + str(ts), 'last_shifts.csv', last_shifts)
        
        Capacity = np.genfromtxt("filesDB/" + str(ts) + "/capacity.csv", delimiter=";")
        scores = np.genfromtxt("scores.csv",delimiter=";")
        people = np.genfromtxt("filesDB/" + str(ts) + "/people.csv", dtype=str, delimiter=";").tolist()
        last_shifts = np.genfromtxt("filesDB/" + str(ts) + "/last_shifts.csv", dtype=str, delimiter=";").tolist()
        initial_rest_periods = list(tuple(map(int, line)) for line in reader(open("filesDB/" + str(ts) + "/initial_rest_periods.csv"))) 

        sol, acts = month_rosterV2(Capacity,scores,
                        num_weeks = num_weeks,
                        shift_filter = shift_filter,
                        madrugada = madrugada,
                        dia = dia,
                        tarde = tarde,
                        noche = noche,
                        sinluz = sinluz,
                        rest_time_hours = rest_time_hours,
                        people = people,
                        initial_rest_periods = initial_rest_periods,
                        last_shifts = last_shifts,
                        objective = objective)
        

        roster = {key: ''.join(value[i]['stint'] for i in range(num_weeks)) for key, value in sol.items()}
        roster = {key : ' '.join(value) for key, value in roster.items()}
        with open("filesDB/" + str(ts) + "/Roster.csv", 'w') as f:
            for key in roster.keys():
                f.write("%s, %s\n" % (key, roster[key]))
        

        # Llamar a la función con la ruta local del archivo y el tipo de contenido
        archivo_local = "filesDB/" + str(ts) + "/Roster.csv"
        tipo_contenido = "text/csv"
        url_del_archivo = upload_file(archivo_local, tipo_contenido)
        print(url_del_archivo)
        fecha_actual = datetime.now()
        # Formatear la fecha en el formato deseado
        formato_deseado = "%Y/%m/%d %I:%M:%S %p"
        fecha_formateada = fecha_actual.strftime(formato_deseado)
        
        datosDeConfirmación = {"state": 1, "dateFinish": fecha_formateada, "roster": url_del_archivo}
        actualizar_documento(idDB, datosDeConfirmación)
       # Uso del ejemplo
        destinatario = 'daniel.baquero@talma.com.ec'
        asunto = 'Asunto del correo'
        cuerpo = view_documento(idDB)

        enviar_correo(destinatario, asunto, cuerpo)
        return {
            "mensaje": {
                "idDB": idDB, 
                "routeRosterCSV": roster                
            }
        }
    except Exception as e:
        fecha_actual = datetime.now()
        # Formatear la fecha en el formato deseado
        formato_deseado = "%Y/%m/%d %I:%M:%S %p"
        fecha_formateada = fecha_actual.strftime(formato_deseado)
        datosDeConfirmación = {"state": 2, "dateFinish": fecha_formateada, "e": str(e)}
        # Maneja la excepción si el archivo no se encuentra
        print(e)
        return {"e": e, "idDB": idDB }
        raise HTTPException(status_code=500, detail=str(e))
