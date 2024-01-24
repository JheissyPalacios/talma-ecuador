from fastapi import FastAPI, Form, File, UploadFile, status, Depends, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from fastapi.responses import JSONResponse
import numpy as np
from MonthWrapperV2 import month_rosterV2
import os
from datetime import datetime
from csv import reader
import csv

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
    fecha: str = Form(...),
    idDB: str = Form(...)
 ):
    try:
        now = datetime.now()
        ts = datetime.timestamp(now)

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
        #last_shifts = ['w1' + bb for bb in last_shifts]
        #Descansos = np.genfromtxt("Descansos.csv",delimiter=";")
        #initial_rest_periods = [(0,1),(6,1),(0,1),(5,6),(6,1),(5,6),(1,2),(1,2),(1,2),(1,2),(1,2),(1,2),(2,3),(2,3),(2,3),(6,1),(3,4),(3,4),(3,4),(3,4),(3,4),(3,4),(4,5),(4,5),(4,5),(4,5),(4,5),(5,6),(5,6)]
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
        

        roster = {key : value[0]['stint'] + value[1]['stint'] + value[2]['stint'] + value[3]['stint'] for key, value in sol.items()}
        roster = {key : ' '.join(value) for key, value in roster.items()}
        with open("filesDB/" + str(ts) + "/Roster.csv", 'w') as f:
            for key in roster.keys():
                f.write("%s, %s\n" % (key, roster[key]))
    
       
        return {
            "mensaje": {
                "idDB": idDB, 
                #"routeRosterCSV": "filesDB/" + str(ts) + "/Roster.csv",
                "routeRosterCSV": roster                
            }
        }
    except Exception as e:
        # Maneja la excepción si el archivo no se encuentra
        print(e)
        return {"e": e, "idDB": idDB }
        raise HTTPException(status_code=500, detail=str(e))
