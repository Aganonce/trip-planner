# from urllib2 import Request, urlopen, URLError
import urllib
import json
from geopy.geocoders import Nominatim


APIKey="61ac3343-782f-40e6-ad1e-d8d14b2f1fe3"
APIRootLocation="http://api.tripadvisor.com/api/partner/2.0/location/"
APIRootMap="http://api.tripadvisor.com/api/partner/2.0/map/"

def location_idRequest(Key,Root,ID): ##Returns JSON of specific location id
    request=urllib.request.Request(str(Root)+str(LocationID)+"?key="+str(Key))
    try:
        response=urllib.request.urlopen(request)
        response=response.read()
        response=json.loads(response.decode('utf-8'))
        return response
    except urllib.error.URLError as e:
        print("Got Error Code: ", e)

def getCityCoord(City):
    geolocator=Nominatim()
    location=geolocator.geocode(City)
    return location.latitude,location.longitude

def cityRequest(City,Key,Root): ##returns list of non-hotels in top attractions with Name,WebURL,
    Coords=getCityCoord(City) ##Get lat,long pair
    request=urllib.request.Request(str(Root)+str(Coords[0])+","+str(Coords[1])+"?key="+str(Key))
    try:
        response=urllib.request.urlopen(request)
        response=response.read()
        response=json.loads(response.decode('utf-8'))
        #return response
    except urllib.error.URLError as e:
        print("Got Error Code:", e)
    RestAttract=[]
    for i in range(len(response['data'])):
        if response['data'][i]['category']['localized_name']!="Hotel" and response['data'][i]['rating']!=None:
            #print response['data'][i]['category']['localized_name']
            Name=response['data'][i]['name']
            WebURL=response['data'][i]['web_url']
            Rating=response['data'][i]['rating']
            Photos=response['data'][i]['see_all_photos']
            RestAttract.append([Name,WebURL,Rating,Photos])
    return RestAttract

def assemblePoiData(City):
    return cityRequest(City,APIKey,APIRootMap)

# City="Albany"
# Coord=getCityCoord(City)
# tmp=cityRequest(City,APIKey,APIRootMap) ##Returns top 10 results f



