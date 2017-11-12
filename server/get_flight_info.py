
# coding: utf-8

# In[22]:


from amadeus import Flights
from get_airline_name import *
import json

def get_flight_info(orig, dest, depart_date, ret_date, duration, num_results = '3'):

    duration2 = str(duration) + "--" + str(duration)

    print(duration2)

    flights = Flights("S1ukqxEJjvLGcmtKD1wSPEEp9apIcsiC")
    resp = flights.low_fare_search(
        origin= orig, #'LGA'
        destination= dest,
        departure_date=depart_date,
        return_date=ret_date,
        duration=duration2, #'4--7'
        number_of_results = num_results) #'10'
    
    # Loop over all suggested flights
    if ('results' not in resp):
        return 0
    
    num_results = len(resp['results'])
    outbound_len = [None]*num_results
    outbound_departure_time= [None]*num_results
    outbound_departure_location= [None]*num_results
    outbound_arrival_time = [None]*num_results
    outbound_arrival_location= [None]*num_results
    inbound_len = [None]*num_results
    inbound_departure_time = [None]*num_results
    inbound_departure_location = [None]*num_results
    inbound_arrival_time = [None]*num_results
    inbound_arrival_location = [None]*num_results
    flight_price = [None]*num_results
    num_seats_available_inbound = [[] for i in range(num_results)]
    num_seats_available_outbound = [[] for i in range(num_results)]
    terminal_inbound = [[] for i in range(num_results)]
    terminal_outbound = [[] for i in range(num_results)]
    flight_number_inbound = [[] for i in range(num_results)]
    flight_number_outbound = [[] for i in range(num_results)]
    marketing_airline_inbound = [[] for i in range(num_results)]
    marketing_airline_outbound = [[] for i in range(num_results)]

    print(num_results)
    for i in range(num_results):
        # Outbound
        outbound_len[i] = len(resp['results'][i]['itineraries'][0]['outbound']['flights']) - 1

        outbound_departure_time[i] = resp['results'][i]['itineraries'][0]['outbound']['flights'][0]['departs_at']
        outbound_departure_location[i] = resp['results'][i]['itineraries'][0]['outbound']['flights'][0]['origin']['airport']

        outbound_arrival_time[i] = resp['results'][i]['itineraries'][0]['outbound']['flights'][outbound_len[i]]['arrives_at']
        outbound_arrival_location[i] = resp['results'][i]['itineraries'][0]['outbound']['flights'][outbound_len[i]]['destination']['airport']
        
        for j in resp['results'][i]['itineraries'][0]['outbound']['flights']:
            num_seats_available_outbound[i].append(j['booking_info']['seats_remaining'])
            if 'terminal' in j['destination']:
                terminal_outbound[i].append(j['destination']['terminal'])
            else:
                terminal_outbound[i].append('TBD')
            flight_number_outbound[i].append(j['flight_number'])
            marketing_airline_outbound[i].append(get_airline_name(j['marketing_airline']))
            
        # Inbound
        inbound_len[i] = len(resp['results'][i]['itineraries'][0]['inbound']['flights']) - 1

        inbound_departure_time[i] = resp['results'][i]['itineraries'][0]['inbound']['flights'][0]['departs_at']
        inbound_departure_location[i] = resp['results'][i]['itineraries'][0]['inbound']['flights'][0]['origin']['airport']
        
        inbound_arrival_time[i] = resp['results'][i]['itineraries'][0]['inbound']['flights'][inbound_len[i]]['arrives_at']
        inbound_arrival_location[i] = resp['results'][i]['itineraries'][0]['inbound']['flights'][inbound_len[i]]['destination']['airport']
        
        for j in resp['results'][i]['itineraries'][0]['inbound']['flights']:
            num_seats_available_inbound[i].append(j['booking_info']['seats_remaining'])
            if 'terminal' in j['destination']:
                terminal_inbound[i].append(j['destination']['terminal'])
            else:
                terminal_inbound[i].append('TBD')
            flight_number_inbound[i].append(j['flight_number'])
            marketing_airline_inbound[i].append(get_airline_name(j['marketing_airline']))
            
        flight_price[i] = resp['results'][i]['fare']['total_price']

    return outbound_len, inbound_len, outbound_departure_time, outbound_departure_location, outbound_arrival_time, outbound_arrival_location, inbound_departure_time, inbound_departure_location, inbound_arrival_time, inbound_arrival_location, flight_price, num_seats_available_inbound, num_seats_available_outbound, terminal_inbound, terminal_outbound, flight_number_inbound, flight_number_outbound, marketing_airline_inbound, marketing_airline_outbound


# # In[23]:


# flight_info = get_flight_info('ALB', 'SXF', '2018-04-02', '2018-04-23', '7--7')
# flight_info


# # In[ ]:


# origin_location = 'ALB'
# depart_date = '2018-04-02'
# return_date = '2018-04-23'
# duration = '7--7'

# for i in kory_list:
#     flight_info = get_flight_info('ALB', i, depart_date, return_date, duration)
#     if flight_info != 0:
#         break

