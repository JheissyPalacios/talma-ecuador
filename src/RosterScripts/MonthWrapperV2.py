# -*- coding: utf-8 -*-
"""
Created on Thu Aug 17 15:23:51 2023

@author: dbaquero
"""

import numpy as np
from Stint_func_Shortage_PeriodsV2 import stint_roster
from Stint_func_Shortage_PeriodsV2 import create_stints
from Stint_func_Shortage_PeriodsV2 import add_sol
from Stint_func_Shortage_PeriodsV2 import get_activations
from Stint_func_Shortage_PeriodsV2 import get_periods
from Stint_func_Shortage_PeriodsV2 import get_last_shift
from datetime import datetime

def month_rosterV2(Capacity,scores,
                 num_weeks,
                 shift_filter = True,
                 madrugada = 3,
                 dia = 5,
                 tarde = 5,
                 noche = 3,
                 sinluz = 4,
                 rest_time_hours = 48,
                 people = [],
                 initial_rest_periods = [],
                 last_shifts = [],
                 objective = 'Balanced'):
    
    
    initial_time = datetime.now()
    print("Tiempo de Inicio: " + str(initial_time))
    
    print('Inicio Stints: ' + str(datetime.now()))
    valid_stints, stints_name, stint_dat, stint_score, shifts_name, comp_matrix, shifts, valid_idx, periods_dict, stint_dict = create_stints(
        Capacity = Capacity,
        scores = scores,
        shift_filter = shift_filter,
        madrugada = madrugada,
        dia = dia,
        tarde = tarde,
        noche = noche,
        sinluz = sinluz,
        rest_time_hours = rest_time_hours)
    
    
    print("shift_filter: " + str(shift_filter))
    print("madrugada: " + str(madrugada))
    print("dia: " + str(dia))
    print("tarde: " + str(tarde))
    print("noche: " + str(noche))
    print("sinluz: " + str(sinluz))
    print("rest_time_hours: " + str(rest_time_hours))
    print("objective: " + str(objective))
    
    print('Final Stints - Tiempo Transcurrido: ' + str(datetime.now() - initial_time))
    
    for w in range(num_weeks):
        
        print('Iteración '+ str(w) + ' - Tiempo Transcurrido: ' + str(datetime.now() - initial_time))
        
        if w == 0:
            solx, y = stint_roster(
                valid_stints,
                stint_dat,
                stints_name,
                stint_score,
                shifts_name,
                comp_matrix,
                shifts,
                valid_idx,
                periods_dict,
                people = people,
                initial_data = True,
                rest_periods = initial_rest_periods,
                last_shift = last_shifts,
                objective = objective)
            
            sol = add_sol(solx, stint_dict, first = True)
            acts = get_activations(y)
            new_periods = get_periods(sol,w,people)
            prev_s = get_last_shift(sol,w,people)
        else:
            solx, y = stint_roster(
                valid_stints,
                stint_dat,
                stints_name,
                stint_score,
                shifts_name,
                comp_matrix,
                shifts,
                valid_idx,
                periods_dict,
                people = people,
                initial_data = True,
                rest_periods = new_periods,
                objective = objective,
                last_shift = prev_s)
            
            sol = add_sol(solx, stint_dict, first = False, prev = sol)
            acts = get_activations(y, prev = acts)
            new_periods = get_periods(sol,w,people)
            prev_s = get_last_shift(sol,w,people)
            
    end_time = datetime.now()
    duration_time = end_time - initial_time
    print('Tiempo de Finalización: ' + str(end_time))
    print('Duración: ' + str(duration_time))
            
    return sol, acts
        
