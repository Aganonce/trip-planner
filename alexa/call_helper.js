var _ = require('lodash');
var rp = require('request-promise');
var apiAddress = '';

function tripCaller() {
}

tripCaller.prototype.callDestination = function(city, runcompute) {
  return this.destinationCall(city, runcompute).then(
    function(response) {
      return response.body
    }
  );
};

tripCaller.prototype.destinationCall = function(city, runcompute) {
  var options = {
    method: 'GET',
    uri: apiAddress + '/call_destination',
    qs: {
      city: city,
      runcompute: runcompute
    },
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

tripCaller.prototype.callAvailabilityRange = function(availrange) {
  return this.availabilityRangeCall(availrange).then(
    function(response) {
      return response.body
    }
  );
};

tripCaller.prototype.availabilityRangeCall = function(availrange) {
  var options = {
    method: 'GET',
    uri: apiAddress + '/call_availability_range',
    qs: {
      availrange: availrange
    },
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

tripCaller.prototype.callOptimalRange = function(dayrange) {
  return this.optimalRangeCall(dayrange).then(
    function(response) {
      return response.body
    }
  );
};

tripCaller.prototype.optimalRangeCall = function(dayrange) {
  var options = {
    method: 'GET',
    uri: apiAddress + '/call_optimal_range',
    qs: {
      dayrange: dayrange
    },
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

tripCaller.prototype.callTravelGroupSize = function(travelGroupSize) {
  return this.travelGroupSizeCall(travelGroupSize).then(
    function(response) {
      return response.body
    }
  );
};

tripCaller.prototype.travelGroupSizeCall = function(travelGroupSize) {
  var options = {
    method: 'GET',
    uri: apiAddress + '/call_travel_group_size',
    qs: {
      travelGroupSize: travelGroupSize
    },
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

tripCaller.prototype.callTravelGroupTypes = function(groupTypes) {
  return this.travelGroupTypesCall(groupTypes).then(
    function(response) {
      return response.body
    }
  );
};

tripCaller.prototype.travelGroupTypesCall = function(groupTypes) {
  var options = {
    method: 'GET',
    uri: apiAddress + '/call_travel_group_types',
    qs: {
      groupTypes: groupTypes
    },
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

tripCaller.prototype.callFinanceAmount = function(moneyamount) {
  return this.financeAmountCall(moneyamount).then(
    function(response) {
      return response.body
    }
  );
};

tripCaller.prototype.financeAmountCall = function(moneyamount) {
  var options = {
    method: 'GET',
    uri: apiAddress + '/call_finance_amount',
    qs: {
      moneyamount: moneyamount
    },
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

tripCaller.prototype.callSpendingType = function(spendingtype, runcompute) {
  return this.spendingTypeCall(spendingtype, runcompute).then(
    function(response) {
      return response.body
    }
  );
};

tripCaller.prototype.spendingTypeCall = function(spendingtype, runcompute) {
  var options = {
    method: 'GET',
    uri: apiAddress + '/call_spending_type',
    qs: {
      spendingtype: spendingtype,
      runcompute: runcompute
    },
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

tripCaller.prototype.callTravelType = function(traveltype, zip) {
  return this.travelTypeCall(traveltype, zip).then(
    function(response) {
      return response.body
    }
  );
};

tripCaller.prototype.travelTypeCall = function(traveltype, zip) {
  var options = {
    method: 'GET',
    uri: apiAddress + '/call_travel_type',
    qs: {
      traveltype: traveltype,
      zip: zip
    },
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

tripCaller.prototype.callClimateType = function(climatetype) {
  return this.climateTypeCall(climatetype).then(
    function(response) {
      return response.body
    }
  );
};

tripCaller.prototype.climateTypeCall = function(climatetype) {
  var options = {
    method: 'GET',
    uri: apiAddress + '/call_climate_type',
    qs: {
      climatetype: climatetype
    },
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

tripCaller.prototype.callFlightNumber = function(flightnumber) {
  return this.flightNumberCall(flightnumber).then(
    function(response) {
      return response.body
    }
  );
};

tripCaller.prototype.flightNumberCall = function(flightnumber) {
  var options = {
    method: 'GET',
    uri: apiAddress + '/call_flight_type',
    qs: {
      flightnumber: flightnumber
    },
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

module.exports = tripCaller;