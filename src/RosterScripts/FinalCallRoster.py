# -*- coding: utf-8 -*-
"""
Created on Tue Aug 29 10:42:33 2023

@author: dbaquero
"""

import numpy as np
from MonthWrapperV2 import month_rosterV2

Capacity = np.genfromtxt("RosterNovUIO/Monitores/Capacity.csv",delimiter=";")
Descansos = np.genfromtxt("RosterNovUIO/Monitores/Descansos.csv",delimiter=";")
scores = np.genfromtxt("scores.csv",delimiter=";")
people = np.genfromtxt("RosterNovUIO/Monitores/Personas.csv",str,delimiter=";").tolist()
initial_rest_periods = [(0,1),(6,1),(0,1),(5,6),(6,1),(5,6),(1,2),(1,2),
(1,2),(1,2),(1,2),(1,2),(2,3),(2,3),(2,3),(6,1),
(3,4),(3,4),(3,4),(3,4),(3,4),(3,4),(4,5),(4,5),
(4,5),(4,5),(4,5),(5,6),(5,6)]
initial_rest_periods = list(tuple(line) for line in                       
		reader(open("RosterNovUIO/Monitores/initial_rest_periods.csv")))


last_shifts = np.genfromtxt("RosterNovUIO/Monitores/Last_shifts.csv",str,delimiter=";").tolist()
#last_shifts = ['w1' + bb for bb in last_shifts]

sol, acts = month_rosterV2(Capacity,scores,
                 num_weeks = 4,
                 shift_filter = True,
                 madrugada = 3,
                 dia = 5,
                 tarde = 5,
                 noche = 3,
                 sinluz = 4,
                 rest_time_hours = 52,
                 people = people,
                 initial_rest_periods = initial_rest_periods,
                 last_shifts = last_shifts,
                 objective = 'Balanced')

roster = {key : value[0]['stint'] + value[1]['stint'] + value[2]['stint'] + value[3]['stint'] for key, value in sol.items()}
roster = {key : ' '.join(value) for key, value in roster.items()}

with open('RosterNovUIO/Monitores/Roster.csv', 'w') as f:
    for key in roster.keys():
        f.write("%s, %s\n" % (key, roster[key]))
    
