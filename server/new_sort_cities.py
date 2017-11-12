from Latitude_Temp import *
from airport_data import *
import pandas as pd
from random import shuffle
import pickle
import sort_cities

def shuffle_pickle_key(pickle_file):
    pickle_dict = pickle.load(open(pickle_file,"rb"))
    lst = pickle_dict.keys()
    shuffle(list(lst))
    return lst

def new_sort_cities(input_climate,input_intl_dom, date_range):
    print(input_climate)
    start_mo = conv_date_to_string(date_range,0)
    end_mo = conv_date_to_string(date_range,1)
    avg_mo = (start_mo + end_mo)/2
    
    if (avg_mo >= 4  and avg_mo <= 8):
        keylist = shuffle_pickle_key("tempdict_summer.pickle")
        pickle_dict = pickle.load(open("tempdict_summer.pickle","rb"))
    else:
        keylist = shuffle_pickle_key("tempdict_winter.pickle")
        pickle_dict = pickle.load(open("tempdict_winter.pickle","rb"))
        
    print(pickle_dict)

    while_index = 0
    city_list = []
    while len(city_list) <= 2:
        city = list(keylist)[while_index]
        print(city)
        if pickle_dict[city] == input_climate and sort_cities.intl_or_domestic(city) == input_intl_dom:
            print('trigger')
            city_list.append(city)
        while_index += 1
    
    return city_list[0] + ", " + city_list[1] + ", and " + city_list[2]
