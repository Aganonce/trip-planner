
# coding: utf-8

# In[1]:

from urllib2 import Request, urlopen, URLError
import json
from geopy.geocoders import Nominatim
from amadeus import Hotels
from dateutil import parser
import datetime
import numpy as np


# In[3]:

AmadeusAPIKey="6LmigYdQ45sVgfinoP8SSZDfYXcj0b3B"


# In[4]:

def getCityCoord(City):
    geolocator=Nominatim()
    location=geolocator.geocode(City)
    return location.latitude,location.longitude


# In[18]:

def findHotels(City,StartDate,EndDate,TotalCost,NumRooms):
    sd=parser.parse(StartDate)
    ed=parser.parse(EndDate)
    Coords=getCityCoord(City)
    TripLength=ed-sd
    Days=TripLength.days
    DailyCost=float(TotalCost)/(float(NumRooms)*float(Days))
    hotels = Hotels(AmadeusAPIKey)
    response = hotels.search_circle (
        check_in=sd.date(), ##Date Format must be year-month-date
        check_out=ed.date(),
        latitude=float(Coords[0]),
        longitude=float(Coords[1]),
        currency='USD',
        max_rate=DailyCost,
        radius=10)
    #print response
    #print len(response['results'])
    #print response['results'][i]['rooms'][0]['room_type_code'][1].isdigit()
    RoomswithBeds=[]
    for i in range(len(response['results'])):
        HasRoom=response['results'][i]['rooms'][0]['room_type_code'][1].isdigit()
        if HasRoom:
            RoomswithBeds.append(response['results'][i])
    CheapestRooms=[]
    for i in range(3):
        CheapestRooms.append(RoomswithBeds[i])
    return CheapestRooms


# In[87]:

def orgHotelData(Hotel):
    tmp=[[0]*8 for x in xrange(3)]
    print tmp[0]
    for i in range(len(Hotel)):
        HotelName=Hotel[i]['property_name']
        tmp[i][0]=HotelName
        HotelCountry=Hotel[i]['address']['country']
        tmp[i][1]=HotelCountry
         #HotelRegion=Hotel[i]['address']['region']
        HotelCity=Hotel[i]['address']['city']
        tmp[i][2]=HotelCity
        HotelLine=Hotel[i]['address']['line1']
        tmp[i][3]=HotelLine
        TotPrice=NumPeople*float(Hotel[i]['total_price']['amount'])
        tmp[i][4]=TotPrice
        if len(Hotel[i]['awards'])!=0:
            AwardProvider=Hotel[i]['awards'][0]['provider']
            AwardRating=Hotel[i]['awards'][0]['rating']
        tmp[i][5]=AwardProvider
        tmp[i][6]=AwardRating
        BookingCode=Hotel[i]['rooms'][0]['booking_code']
        tmp[i][7]=BookingCode
    return tmp


# In[20]:

StartDate="Jan 25 2018"
EndDate="Jan 30 2018"
TotalCost=2000
NumPeople=1
Days=5
resp=findHotels("Albany",StartDate,EndDate,TotalCost,NumPeople)


# In[88]:

orgHotelData(resp)

