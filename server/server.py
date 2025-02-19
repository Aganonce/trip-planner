#!/usr/bin/env python
# -*- coding: utf-8 -*-

# activate_this = '/home/james/apps/fen/bin/activate_this.py'
# execfile(activate_this, dict(__file__=activate_this))
# exec(open(activate_this).read())

import sys
import asyncio
import aiohttp.web
import re
import io
import json
import datetime

import airport_data
import get_flight_info

import new_sort_cities
import HotelFinder
import POIFinder

# Define global variables


class Service:
    def __init__(self, css=None):
        self.css = css
        self.city = "Chicago"
        self.availrange = ['2018-04-01', '2018-04-07']
        # self.availrange = []
        self.dayrange = 4
        # self.dayrange = ''
        self.groupSize = ''
        self.groupTypes = ''
        self.moneyamount = ''
        self.spendingtype = ''
        self.traveltype = 'international'
        # self.traveltype = ''
        self.zipcode = [-73.6633,42.7294]
        self.climatetype = 'Warm'
        # self.climatetype = ''
        self.calculated_temp = ''
        self.flightnumber = ''
        self.flightdata = []

    @asyncio.coroutine
    def call_flight_type(self, request):
        try:
            print(request)
            self.flightnumber = request.GET["flightnumber"]
            print(self.flightnumber)
        except KeyError:
            raise aiohttp.web.HTTPBadRequest(reason="range required")
        except ValueError:
            raise aiohttp.web.HTTPBadRequest(reason="invalid range")
        # print(POIFinder.assemblePoiData(self.city))
        # print(HotelFinder.assembleHotelData(self.city, self.availrange[0], self.availrange[1], float(self.moneyamount), int(self.groupSize)))
        data = [POIFinder.assemblePoiData(self.city), HotelFinder.assembleHotelData(self.city, self.availrange[0], self.availrange[1], float(self.moneyamount), int(self.groupSize))]
        print(data)
        return aiohttp.web.json_response(data = data)
        # return aiohttp.web.Response(text='Hurr durr I am a hotel.')

    @asyncio.coroutine
    def call_climate_type(self, request):
        try:
            print(request)
            self.climatetype = request.GET["climatetype"].capitalize()
            print(self.climatetype)
        except KeyError:
            raise aiohttp.web.HTTPBadRequest(reason="range required")
        except ValueError:
            raise aiohttp.web.HTTPBadRequest(reason="invalid range")
        text = new_sort_cities.new_sort_cities(self.climatetype, self.traveltype, self.availrange)
        print(text)
        return aiohttp.web.Response(text=text)

    @asyncio.coroutine
    def call_travel_type(self, request):
        try:
            print(request)
            self.traveltype = request.GET["traveltype"]
            self.zipcode = request.GET["zip"].split('|')
            print(self.zipcode)
            self.zipcode = [float(i) for i in self.zipcode]
            print(self.traveltype)
            print(self.zipcode)
        except KeyError:
            raise aiohttp.web.HTTPBadRequest(reason="range required")
        except ValueError:
            raise aiohttp.web.HTTPBadRequest(reason="invalid range")
        return aiohttp.web.Response(text='Test 8 complete.')

    @asyncio.coroutine
    def call_spending_type(self, request):
        # RUN WRAPPER PROGRAM IF runcompute IS TRUE
        try:
            print(request)
            self.spendingtype = request.GET["spendingtype"]
            runcompute = request.GET["runcompute"]
            print(runcompute)
            print(self.spendingtype)
        except KeyError:
            raise aiohttp.web.HTTPBadRequest(reason="range required")
        except ValueError:
            raise aiohttp.web.HTTPBadRequest(reason="invalid range")

        flight_data = []
        flight_cards = [[], [], []]
        if (runcompute == 'true'):
            flight_data = get_flight_info.get_flight_info(airport_data.nearest_iata_code(self.zipcode[0], self.zipcode[1]), airport_data.get_iata_code(self.city), self.availrange[0], self.availrange[1], self.dayrange)
            self.flightdata = flight_data
            for i in range(2):
                for j in range(len(flight_data)):
                    flight_cards[i].append(flight_data[j][i])
            print(flight_cards[0])
            return aiohttp.web.json_response(data = flight_cards)
        else:
            return aiohttp.web.Response(text='Test 7 complete.')

    @asyncio.coroutine
    def call_finance_amount(self, request):
        try:
            print(request)
            self.moneyamount = request.GET["moneyamount"]
            print(self.moneyamount)
        except KeyError:
            raise aiohttp.web.HTTPBadRequest(reason="range required")
        except ValueError:
            raise aiohttp.web.HTTPBadRequest(reason="invalid range")
        return aiohttp.web.Response(text='Test 6 complete.')

    @asyncio.coroutine
    def call_travel_group_types(self, request):
        try:
            print(request)
            self.groupTypes = request.GET["groupTypes"]
            print(self.groupTypes)
        except KeyError:
            raise aiohttp.web.HTTPBadRequest(reason="range required")
        except ValueError:
            raise aiohttp.web.HTTPBadRequest(reason="invalid range")
        return aiohttp.web.Response(text='Test 5 complete.')

    @asyncio.coroutine
    def call_travel_group_size(self, request):
        try:
            print(request)
            self.groupSize = request.GET["travelGroupSize"]
            print(self.groupSize)
        except KeyError:
            raise aiohttp.web.HTTPBadRequest(reason="range required")
        except ValueError:
            raise aiohttp.web.HTTPBadRequest(reason="invalid range")
        return aiohttp.web.Response(text='Test 4 complete.')

    @asyncio.coroutine
    def call_optimal_range(self, request):
        try:
            print(request)
            self.dayrange = request.GET["dayrange"]
            print(self.dayrange)
        except KeyError:
            raise aiohttp.web.HTTPBadRequest(reason="range required")
        except ValueError:
            raise aiohttp.web.HTTPBadRequest(reason="invalid range")
        return aiohttp.web.Response(text='Test 3 complete.')

    @asyncio.coroutine
    def call_availability_range(self, request):
        try:
            print(request)
            self.availrange = request.GET["availrange"].split("|")
            print(self.availrange)
        except KeyError:
            raise aiohttp.web.HTTPBadRequest(reason="range required")
        except ValueError:
            raise aiohttp.web.HTTPBadRequest(reason="invalid range")
        print('Retrieving city: ' + self.city)
        print(self.city)
        text = ' '
        # if (self.city != 'unknown' and self.city != ''):
        #     text = 'B T W, Kory says that city will be ' + temp_test.get_final_temp(self.city, self.availrange) + ' during the given time range.'
        return aiohttp.web.Response(text=text)

    @asyncio.coroutine
    def call_destination(self, request):
        # RUN WRAPPER PROGRAM IF runcompute IS TRUE
        try:
            # print(request)
            self.city = request.GET["city"]
            runcompute = request.GET["runcompute"]
            # print(self.runcompute)
            # print(self.city)
        except KeyError:
            raise aiohttp.web.HTTPBadRequest(reason="range required")
        except ValueError:
            raise aiohttp.web.HTTPBadRequest(reason="invalid range")
        

        # zipcode = [-73.6633,42.7294]

        # print(airport_data.give_airport_recommendation(df, self.city))

        city_temp = self.city

        flight_data = []
        flight_cards = [[], [], []]
        # runcompute = 'true'
        print(runcompute)
        if (runcompute == 'true'):
            print('running lol')
            flight_data = get_flight_info.get_flight_info(airport_data.nearest_iata_code(self.zipcode[0], self.zipcode[1]), airport_data.get_iata_code(city_temp), self.availrange[0], self.availrange[1], self.dayrange)
            self.flightdata = flight_data
            for i in range(2):
                for j in range(len(flight_data)):
                    flight_cards[i].append(flight_data[j][i])
            print(flight_data)
            return aiohttp.web.json_response(data = flight_cards)
        else:
            return aiohttp.web.Response(text='Test 1 complete.')

    @asyncio.coroutine
    def home(self, request):
        return aiohttp.web.Response(text='Welcome to Trip Planner.')
            

app = aiohttp.web.Application()

service = Service(None)
app.router.add_get("/call_flight_type", service.call_flight_type)
app.router.add_get("/call_climate_type", service.call_climate_type)
app.router.add_get("/call_travel_type", service.call_travel_type)
app.router.add_get("/call_spending_type", service.call_spending_type)
app.router.add_get("/call_finance_amount", service.call_finance_amount)
app.router.add_get("/call_travel_group_types", service.call_travel_group_types)
app.router.add_get("/call_travel_group_size", service.call_travel_group_size)
app.router.add_get("/call_optimal_range", service.call_optimal_range)
app.router.add_get("/call_availability_range", service.call_availability_range)
app.router.add_get("/call_destination", service.call_destination)
app.router.add_get("/", service.home)

loop = asyncio.get_event_loop()
ser = loop.create_server(app.make_handler(), '0.0.0.0', 49154)
srv = loop.run_until_complete(ser)
print('serving on', srv.sockets[0].getsockname())
try:
    loop.run_forever()
except KeyboardInterrupt:
    pass
