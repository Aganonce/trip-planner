from Latitude_Temp import *
from airport_data import *
import pandas as pd

date_range = ['2017-06-15', '2017-09-30']
input_climate = "Cold"
input_intl_dom = "Domestic"
my_long, my_lat = -73.691785, 42.728412
input_coords = [my_long, my_lat]
df = load_airport_csv()

def intl_or_domestic(city):
    try:
        country = give_airport_recommendation(df,city)["iso_country"].tolist()[0]
        if country == "US":
            return "Domestic"
        else:
            return "International"
    except:
        return "None"

def sort_cities(input_climate,input_intl_dom, date_range):
    city_list = []
    tour_data = pd.read_csv("top_tourist_destinations.csv")
    while_index = 0
    while len(city_list) <= 2:
        city = tour_data["City"].iloc[while_index]
        if get_final_temp(city, date_range) == input_climate and intl_or_domestic(city) == input_intl_dom:
            city_list.append(city)
        while_index += 1

    return city_list

sort_cities("Cold","International",date_range)
