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

import sort_cities
import HotelFinder
import POIFinder

# Define global variables


class Service:
    def __init__(self, css=None):
        self.css = css
        self.city = ''
        # self.availrange = ['2018-04-01', '2018-04-07']
        self.availrange = []
        self.dayrange = ''
        self.groupSize = ''
        self.groupTypes = ''
        self.moneyamount = ''
        self.spendingtype = ''
        # self.traveltype = 'International'
        self.traveltype = ''
        self.zipcode = []
        # self.climatetype = 'Warm'
        self.climatetype = ''
        self.calculated_temp = ''
        self.flightnumber = ''

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
        text = sort_cities.sort_cities(self.climatetype, self.traveltype, self.availrange)
        print(text)
        return aiohttp.web.Response(text=text)

    @asyncio.coroutine
    def call_travel_type(self, request):
        try:
            print(request)
            self.traveltype = request.GET["traveltype"].capitalize()
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
            self.runcompute = request.GET["runcompute"]
            print(self.runcompute)
            print(self.spendingtype)
        except KeyError:
            raise aiohttp.web.HTTPBadRequest(reason="range required")
        except ValueError:
            raise aiohttp.web.HTTPBadRequest(reason="invalid range")
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
        try:
            print(request)
            self.city = request.GET["city"]
            self.runcompute = request.GET["runcompute"]
            print(self.runcompute)
            print(self.city)
        except KeyError:
            raise aiohttp.web.HTTPBadRequest(reason="range required")
        except ValueError:
            raise aiohttp.web.HTTPBadRequest(reason="invalid range")
        return aiohttp.web.Response(text='Test 1 complete.')
        # return aiohttp.web.json_response(data = POIFinder.assemblePoiData(self.city))

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
