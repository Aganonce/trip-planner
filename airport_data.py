import pandas as pd
from math import radians, cos, sin, asin, sqrt

def load_airport_csv():
    df = pd.read_csv("airport-codes.csv", usecols=[1,2,3,6,7,8,10])
    dflarge = df[df.values == "large_airport"]
    dfmed = df[df.values == "medium_airport"]
    pieces = (dflarge,dfmed)
    df = pd.concat(pieces, ignore_index = True)
    return df

def give_airport_recommendation(df, city):
    dfrec = df[df.values == city]
    if (len(dfrec[dfrec.values == "large_airport"]) != 0 and len(dfrec) != 1):
        dfrec = dfrec[dfrec.values == "large_airport"]
        if len(dfrec[dfrec.values == city]) != 1:
            dfrec = dfrec.iloc[[0]]
    return dfrec.iloc[[0]]
            
def haversine(lon1, lat1, lon2, lat2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    """
    # convert decimal degrees to radians 
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    # haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    km = 6367 * c
    return km

def compare_coordinates(my_long, my_lat, data):
    coord_list = []
    for ind, row in df.iterrows():
        target_long = float(data['coordinates'].tolist()[ind].split(",")[0])
        target_lat = float(data['coordinates'].tolist()[ind].split(",")[1])
        coord_list.append(haversine(my_long, my_lat, target_long, target_lat))
    return coord_list

def nearest_airport(my_long, my_lat, data):
    distances = compare_coordinates(my_long, my_lat, df)
    val, idx = min((val, idx) for (idx, val) in enumerate(distances))
    return df.iloc[idx]

#How to run:
#df = load_airport_csv()
#my_long, my_lat = -73.691785, 42.728412
#nearest_airport(my_long, my_lat, df)
