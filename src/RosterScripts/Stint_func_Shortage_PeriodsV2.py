# -*- coding: utf-8 -*-
"""
Created on Mon Jul 24 13:49:44 2023

@author: dbaquero
"""

def create_stints(Capacity,
                  scores,
                  week_num = 1,
                  score_filter = False,
                  min_quantile = 0,
                  max_quantile = 1,
                  shift_filter = False,
                  madrugada = 0,
                  dia = 0,
                  tarde = 0,
                  noche = 0,
                  sinluz = 0,
                  rest_time_hours = 48):
    
    import numpy as np
    import datetime
    from datetime import timedelta as td
    from itertools import compress
    from collections import Counter

    T = ['0000','0030','0100','0130','0200','0230','0300','0330','0400','0430',
         '0500','0530','0600','0630','0700','0730','0800','0830','0900','0930',
         '1000','1030','1100','1130','1200','1230','1300','1330','1400','1430',
         '1500','1530','1600','1630','1700','1730','1800','1830','1900','1930',
         '2000','2030','2100','2130','2200','2230','2300','2330']
    D = ['Lu','Ma','Mi','Ju','Vi','Sa','Do']
    init = datetime.datetime(2023,3,6)
    shiftlen = td(hours=9)
    inbetween = td(hours=12)
    
    shifts = {}
    shifts_name = []

    weekname = "w" + str(week_num)
    
    for j, day in enumerate(D):
        for i, time in enumerate(T):
            if np.sum(Capacity[i,:]) > 0:
                shiftname = weekname + day + time
                shifts[shiftname] = {}
                shiftstart = init + td(days=j,minutes=(i*30))
                shiftend = shiftstart + shiftlen
                shifts[shiftname]['start'] = shiftstart
                shifts[shiftname]['end'] = shiftend
                shifts[shiftname]['demand'] = Capacity[i,j]
                shifts[shiftname]['week'] = week_num
                shifts[shiftname]['score'] = scores[i,j]
                shifts_name.append(shiftname)
                
    
    def next_valid(current, shifts_list, shifts_dict, inbetween, remaining = td(hours=0)):
        time = shifts_dict[current]['end'] + inbetween + remaining
        current_date = shifts_dict[current]['start'].date()
        for i, name in enumerate(shifts_list):
            if shifts_dict[name]['start'] >= time and shifts_dict[name]['start'].date() != current_date:
                return i
            elif i == len(shifts_list)-1:
                return i+1

    totaltime = td(hours=9)*5 + inbetween*4 + td(hours=48)
    surplus = td(days=7) - totaltime
    last_time = init + surplus + td(hours=48)
    for i, name in enumerate(shifts_name):
        if shifts[name]['start'] >= last_time:
            start_shifts = shifts_name[:i]
            break
    start_shifts = start_shifts[:-1]
        
    stints = []    
    for i, name_i in enumerate(start_shifts):
        stint = []
        list_i = shifts_name[next_valid(name_i,shifts_name,shifts,inbetween):]
        if len(list_i) == 0:
            break
        else:
            stint.append(name_i)
            for j, name_j in enumerate(list_i):
                list_j = shifts_name[next_valid(name_j,shifts_name,shifts,inbetween):]
                if len(list_j) == 0:
                    break
                else:
                    stint.append(name_j)
                    for k, name_k in enumerate(list_j):
                        list_k = shifts_name[next_valid(name_k,shifts_name,shifts,inbetween):]
                        if len(list_k) == 0:
                            break
                        else:
                            stint.append(name_k)
                            for l, name_l in enumerate(list_k):
                                list_l = shifts_name[next_valid(name_l,shifts_name,shifts,inbetween):]
                                if len(list_l) == 0:
                                    break
                                else:
                                    stint.append(name_l)
                                    for m, name_m in enumerate(list_l):
                                        stint.append(name_m)
                                        stints.append(stint[:])
                                        stint.pop()
                                stint.pop()
                        stint.pop()
                stint.pop() 
        stint.pop()
            
    stint_dat = []    
    stint_idx = []
    for stint in stints:
        max_td = shifts[stint[0]]['start'] - init
        max_idx = (0,1)
        for i in range(1,5):
            delta = shifts[stint[i]]['start'] - shifts[stint[i-1]]['end']
            if delta > max_td:
                max_td = delta
                max_idx = (i,i+1)
        if (init+td(days=7)) - shifts[stint[i]]['end'] > max_td:
            max_td = (init+td(days=7)) - shifts[stint[i]]['end']
            max_idx = (i+1,i+2)
        stint_dat.append(max_td)
        stint_idx.append(max_idx)
        
    long_rest = []

    for stint in stint_dat:
        if stint >= td(hours=rest_time_hours):
            long_rest.append(True)
        else:
            long_rest.append(False)

    sp_stints = []
    for stint in stints:
    	f = stint[0]
    	l = stint[4]
    	if f[:4] == 'w1Ma' and l[:4] == 'w1Sa':
    		if shifts[l]['end'] <= init + td(days=6):
    			sp_stints.append(stint)
                
    sp_idx = [(6,1)] * len(sp_stints)
                
    sp_dat = []    
    for stint in sp_stints:
        max_td = shifts[stint[0]]['start'] - init
        for i in range(1,5):
            delta = shifts[stint[i]]['start'] - shifts[stint[i-1]]['end']
            if delta > max_td:
                max_td = delta
        if (init+td(days=7)) - shifts[stint[i]]['end'] > max_td:
            max_td = (init+td(days=7)) - shifts[stint[i]]['end']
        sp_dat.append(max_td)

    valid_stints = list(compress(stints,long_rest))
    valid_idx = list(compress(stint_idx,long_rest))
    stint_dat = list(compress(stint_dat,long_rest))
    
    valid_stints = valid_stints + sp_stints
    valid_idx = valid_idx + sp_idx
    stint_dat = stint_dat + sp_dat
    
    del sp_stints, sp_idx, sp_dat
    
    stint_score = []
    for stint in valid_stints:
        cum_score = 0
        for shift in stint:
            cum_score += shifts[shift]['score']
        stint_score.append(cum_score)
        
    comp = {'0000':'madrugada','0030':'madrugada','0100':'madrugada',
            '0130':'madrugada','0200':'madrugada','0230':'madrugada',
            '0300':'madrugada','0330':'madrugada','0400':'madrugada',
            '0430':'madrugada','0500':'madrugada','0530':'madrugada',
            '0600':'dia','0630':'dia','0700':'dia',
            '0730':'dia','0800':'dia','0830':'dia',
            '0900':'dia','0930':'dia','1000':'dia',
            '1030':'dia','1100':'dia','1130':'dia',
            '1200':'tarde','1230':'tarde','1300':'tarde',
            '1330':'tarde','1400':'tarde','1430':'tarde',
            '1500':'tarde','1530':'tarde','1600':'tarde',
            '1630':'tarde','1700':'tarde','1730':'tarde',
            '1800':'noche','1830':'noche','1900':'noche',
            '1930':'noche','2000':'noche','2030':'noche',
            '2100':'noche','2130':'noche','2200':'noche',
            '2230':'noche','2300':'noche','2330':'noche'}
        
    stints_comp = [[comp[shift[-4:]] for shift in stint] for stint in valid_stints]
    stints_comp = [dict(Counter(stint)) for stint in stints_comp]
    
    if score_filter == True:
        min_score = np.quantile(stint_score,min_quantile)
        max_score = np.quantile(stint_score,max_quantile)
        score_f = [score <= max_score and score >= min_score for score in stint_score]

        valid_stints = list(compress(valid_stints, score_f))
        valid_idx = list(compress(valid_idx, score_f))
        stint_dat = list(compress(stint_dat, score_f))
        stint_score = list(compress(stint_score, score_f))
    
    if shift_filter == True:
        comp_f = []
        for stint in stints_comp:
            if 'madrugada' in stint and 'noche' in stint:
                if stint['madrugada'] + stint['noche'] >= sinluz:
                    comp_f.append(False)
                    continue
            if 'madrugada' in stint:
                if stint['madrugada'] >= madrugada:
                    comp_f.append(False)
                    continue
            if 'noche' in stint:
                if stint['noche'] >= noche:
                    comp_f.append(False)
                    continue
            if 'dia' in stint:
                if stint['dia'] >= dia:
                    comp_f.append(False)
                    continue
            if 'tarde' in stint:
                if stint['tarde'] >= tarde:
                    comp_f.append(False)
                    continue
            comp_f.append(True) 
            
        valid_stints = list(compress(valid_stints, comp_f))
        valid_idx = list(compress(valid_idx, comp_f))
        stint_dat = list(compress(stint_dat, comp_f))
        stint_score = list(compress(stint_score, comp_f))
    
    comp_matrix = np.zeros((len(valid_stints),len(shifts_name)))
    for i, stint in enumerate(valid_stints):
        for j, shift in enumerate(shifts_name):
            if shift in stint:
                comp_matrix[i,j] = 1
        
    stints_name = []
    for i in range(len(valid_stints)):
        stints_name.append('stint_'+ str(i))
        
    periods_dict = {
        (0,1):[(0,1)],
        (1,2):[(0,1),(1,2)],
        (2,3):[(1,2),(2,3)],
        (3,4):[(2,3),(3,4)],
        (4,5):[(3,4),(4,5)],
        (5,6):[(4,5),(5,6)],
        (6,1):[(0,1),(6,1)]}
    
    stint_dict = {stints_name[i]:{
        'stint_name':stints_name[i],
        'long_rest':stint_dat[i],
        'score':stint_score[i],
        'rest_period':valid_idx[i],
        'stint':valid_stints[i],
        'stint_start:':shifts[valid_stints[i][0]]['start'],
        'stint_end:':shifts[valid_stints[i][4]]['end']} 
        for i in range(len(valid_stints))}
    
    return valid_stints, stints_name, stint_dat, stint_score, shifts_name, comp_matrix, shifts, valid_idx, periods_dict, stint_dict

def stint_roster(valid_stints,
                 stint_dat,
                 stints_name,
                 stint_score,
                 shifts_name,
                 comp_matrix,
                 shifts,
                 valid_idx,
                 periods_dict,
                 people = [],
                 initial_data = False,
                 rest_periods = [],
                 objective = 'Balanced',
                 last_shift = []):
    import xpress as xp
    from datetime import timedelta as td
    xp.init('c:/xpressmp/bin/xpauth.xpr')

    x = xp.vars(stints_name, people, vartype=xp.binary, name='x')
    y = xp.vars(shifts_name, vartype=xp.integer, lb=0, name='y')

    m = xp.problem(name = 'Rostering')

    m.addVariable(x)
    m.addVariable(y)
    
    if objective == 'Balanced':
        s = xp.var(name='s')
        m.addVariable(s)
        m.addConstraint(y[shift] <= s for shift in shifts_name)
        m.setObjective(s, sense=xp.minimize)
    else:
        m.setObjective(xp.Sum(y), sense=xp.minimize)

    stint_a = [xp.Sum(x[stint,op] for op in people) for stint in stints_name]
    stint_row = []
    for i, stint in enumerate(stint_a):
        stint_row.append(stint*comp_matrix[i,:])
        
    shift_col = []
    for j, shift in enumerate(shifts_name):
        shift_col.append(xp.Sum(row[j] for row in stint_row))
        
    for i, shift in enumerate(shifts_name):
        m.addConstraint(shift_col[i] + y[shift] >= shifts[shift]['demand'])

    for op in people:
        m.addConstraint(xp.Sum(x[stint,op] for stint in stints_name) == 1 )
        
    if initial_data == True:
        for i_op, op in enumerate(people):
            op_period = rest_periods[i_op]
            for j, stint in enumerate(stints_name):
                if valid_idx[j] not in periods_dict[op_period]:
                    m.addConstraint(x[stint,op] == 0)
                    
    if last_shift != []:
        for i_op, op in enumerate(people):
            prev_end = shifts[last_shift[i_op]]['end'] + td(hours=12)
            for j, stint in enumerate(stints_name):
                new_stint_start = shifts[valid_stints[j][0]]['start'] + td(weeks=1) 
                if prev_end >= new_stint_start:
                    m.addConstraint(x[stint,op] == 0)
        
    #m.setControl('miprelstop', 0.1)
    m.setControl('preprobing', 3)
    m.setControl('miplog',3)
    m.setControl('threads',20)
    m.setControl('heuremphasis',1)
    m.setControl('heurthreads',10)
    m.setControl('feasibilitypump',1)
    #m.setControl('maxmipsol',4)
    m.solve()

    solx = m.getSolution(x)
    soly = m.getSolution(y)

    return solx, soly

def add_sol(x, stints_dict, first = True, prev = {}):
    if first == True:
        op_sol = {}
        for key, val in x.items():
            if val == 1:
                op_sol[key[1]] = [stints_dict[key[0]]]
        return op_sol
    else:
        for key, val in x.items():
            if val == 1:
                prev[key[1]].append(stints_dict[key[0]])
        return prev
    
def get_activations(y, prev = []):
    activations = {}
    for shift, act in y.items():
        if act > 0:
            activations[shift] = act
    prev.append(activations)
    return prev

def get_periods(x,i,people):
    return [x[op][i]['rest_period'] for op in people]

def get_last_shift(x,i,people):
    return [x[op][i]['stint'][4] for op in people]
 