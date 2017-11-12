from geopy.geocoders import Nominatim
from dateutil import parser

def get_temp(lat, month):
    temp =""
    if abs(lat) <= 30:
        temp = "Warm"
    elif abs(lat) >= 50:
        temp = "Cold"

    if temp == "":
        if (month >= 4  and month <= 8):
            if lat < 0:
                temp = "Cold"
            else:
                temp = "Warm"
        elif (month < 4  or month > 8):
            if lat < 0:
                temp = "Warm"
            else:
                temp = "Cold"
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
    print temp
    
    if temp[0] != temp[1]:
        return "Cold"
    else:
        return temp[0]
