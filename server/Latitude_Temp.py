from geopy.geocoders import Nominatim
from dateutil import parser

def get_temp(lat, month):
    temp =""
    if abs(lat) <= 30:
        temp = "warm"
    elif abs(lat) >= 50:
        temp = "cold"

    if temp == "":
        if (month >= 4  and month <= 8):
            if lat < 0:
                temp = "cold"
            else:
                temp = "warm"
        elif (month < 4  or month > 8):
            if lat < 0:
                temp = "warm"
            else:
                temp = "cold"
    return temp

def getCityCoord(City):
    geolocator=Nominatim()
    location=geolocator.geocode(City)
    return location.latitude,location.longitude

def determine_climate(city,month):
    lat = getCityCoord(city)[0]
    return get_temp(lat,month)

def conv_date_to_string(date_rng,ind):
    dt = parser.parse(date_rng[ind])
    return dt.month

#Takes input string of city and date string list and returns whether that city is hot or cold 
def get_final_temp(city, date_range):
    temp = ['','']
    for ind, item in enumerate(date_range):
        temp[ind] = determine_climate(city,conv_date_to_string(date_range,ind))
    # print temp
    
    if temp[0] != temp[1]:
        return "cold"
    else:
        return temp[0]
