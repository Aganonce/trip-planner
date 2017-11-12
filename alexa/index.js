var alexa = require("alexa-app");

var request = require('request-promise');

var _ = require('lodash');
var sha512 = require('sha512')

var tripCaller = require('./call_helper');

var app = new alexa.app("chessmaster");

var tripCall = new tripCaller();

var stage = 0;

var unknownDestination = false;

var zip = "-73.6633|42.7294";

var groupSize = 0;

var availrange = '';

var poi_data = [];

// var card_data = [[2, 2, '2018-04-01T06:38', 'ALB', '2018-04-01T14:42', 'YXU', '2018-04-07T13:40', 'YXU', '2018-04-07T21:02', 'ALB', '719.50', [9, 9, 6], [9, 9, 9], ['1', 'A', 'TBD'], ['C', '1', 'TBD'], ['8646', '8200', '3955'], ['4992', '4265', '8661'], ['UA', 'UA', 'UA'], ['UA', 'UA', 'UA']], [2, 2, '2018-04-01T17:30', 'ALB', '2018-04-02T07:12', 'YXU', '2018-04-07T21:20', 'YXU', '2018-04-08T21:02', 'ALB', '805.25', [9, 7, 4], [4, 9, 9], ['1', '2', 'TBD'], ['1', '1', 'TBD'], ['8656', '511', '5286'], ['5287', '514', '8641'], ['AC', 'AC', 'AC'], ['AC', 'AC', 'AC']], [2, 2, '2018-04-01T06:00', 'ALB', '2018-04-01T15:49', 'YXU', '2018-04-07T16:20', 'YXU', '2018-04-08T11:24', 'ALB', '851.62', [7, 9, 9], [9, 9, 7], ['3', 'I', 'TBD'], ['S', '3', 'TBD'], ['7111', '1893', '2401'], ['2352', '2569', '7649'], ['DL', 'DL', 'DL'], ['DL', 'DL', 'DL']]]

/*
---START SKILL---
user: "Open Chess Master."
Alexa: "Hello, user. Welcome to Trip Planner. Where do you want to go? If you don't know, say I don't know."
*/
app.launch(function(req, res) {
  var prompt = 'Welcome to Trip Planner. Where do you want to go?';
  var reprompt = "Where do you want to go?.";
  res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
});


/*
----------------------------------CORE INTENTS----------------------------------
*/
/*
---GET USER WANTED DESTINATION---
stage 0
*/
app.intent('askDestination', {
  'slots': {
    'LOCATIONS': 'AMAZON.US_CITY'
  },
  'utterances': ['I want to go to {-|LOCATIONS}']
},
  function(req, res) {
    var city = req.slot('LOCATIONS');
    console.log(city);

    var prompt = "You said you want to go to " + city + ". ";
    console.log(prompt);
    if (stage >= 7) {
      return tripCall.callDestination(city, true).then(function(response) {
        console.log(response);
        prompt += ' I sent you data on the top flights there to your companion app. Look through the flight options and take your time. Once you\'ve found a flight that you like, say Alexa, tell trip planner that I choose flight number one, two, or so on.';
        stage = 10

        text = ""
        for (i = 0; i < 2; i++) {
          title = "Flight Options";
          specific_card = response[i]
          text += "Option #" + (i + 1) + "\nOutbound stops: " + specific_card[0] + ". Inbound stops: " + specific_card[1] + ". Outbound departure time: " + specific_card[2] + ". Outbound departure location: " 
            + specific_card[3] + ". Outbound arrival time: " + specific_card[4] + ". Outbound arrival location: " + specific_card[5] + ". Inbound departure time: " + specific_card[6] + ". Inbound departure location: " 
            + specific_card[7] + ". Inbound arrival time: " + specific_card[8] + ". Inbound arrival location: " + specific_card[9] + ". Round-trip flight price: $" + specific_card[10] + ".\nInbound Flights: " 
            + specific_card[17][0] + " " + specific_card[15][0] + " at terminal " + specific_card[13][0] + " to " + specific_card[17][1] + " " + specific_card[15][1] + " at terminal " + specific_card[13][1]
            + " to " + specific_card[17][2] + " " + specific_card[15][2] + " at terminal " + specific_card[13][2] + ".\nOutbound flights: " + specific_card[18][0] + " " + specific_card[16][0] + " at terminal " + specific_card[14][0]
            + " to " + specific_card[18][1] + " " + specific_card[16][1] + " at terminal " + specific_card[14][1] + '.\n';
        
        }

        res.card({
          type: "Standard",
          title: title,
          text: text,
          // image: { // image is optional 
          //   smallImageUrl: cardCallUrl, // required 
          //   largeImageUrl: cardCallUrl
          // }
        });

        res.say(prompt).shouldEndSession(true).send();
      });
    } else {
      return tripCall.callDestination(city, false).then(function(response) {
        console.log(response);
        prompt += 'What are the start and end dates of availability?';
        stage = 1
        res.say(prompt).shouldEndSession(false).send();
      });
    }
  }
);

/*
---GET USER START AND END DATES---
stage 1
*/
app.intent('askAvailabilityRange', {
  'slots': {
    'START_DATE': 'AMAZON.DATE',
    'END_DATE': 'AMAZON.DATE'
  },
  'utterances': ['{START_DATE} to {END_DATE}']
},
  function(req, res) {
    var start_date = req.slot('START_DATE');
    var end_date = req.slot('END_DATE');

    if (start_date == undefined || end_date == undefined) {
      res.say('I\'m sorry. I didn\'t understand what you said. Please try again.').shouldEndSession(false).send();
    } else {
      availrange = start_date + '|' + end_date;
      var prompt = "Okay. ";
      console.log(availrange);
      return tripCall.callAvailabilityRange(availrange).then(function(response) {
        console.log(response);
        prompt += 'And what would be the optimal duration of your trip? ' + response;
        stage = 2
        res.say(prompt).shouldEndSession(false).send();
      });
    }
  }
);

/*
---GET USER OPTIMAL TRIP DURATION---
stage 2
*/
app.intent('askTripDuration', {
  'slots': {
    'RANGE': 'AMAZON.NUMBER',
  },
  'utterances': ['{RANGE} days']
},
  function(req, res) {
    var dayrange = req.slot('RANGE');
    var prompt = "Got it. ";


    return tripCall.callOptimalRange(dayrange).then(function(response) {
      console.log(response);
      prompt += 'And how many people would be coming on this trip? Count yourself in this number.';
      stage = 3
      res.say(prompt).shouldEndSession(false).send();
    });
  }
);

/*
---GET USER TRAVEL GROUP---
stage 3
*/
app.intent('askTravelGroup', {
  'slots': {
    'GROUP_SIZE': 'AMAZON.NUMBER',
  },
  'utterances': ['{GROUP_SIZE} people']
},
  function(req, res) {
    var travelGroupSize = req.slot('GROUP_SIZE');
    var prompt = "Understood. ";
    groupSize = Number(travelGroupSize);
    console.log(groupSize);
    if (groupSize == 1) {
      return tripCall.callTravelGroupSize(travelGroupSize).then(function(response) {
        console.log(response);
        prompt += 'I see that you are travelling alone. Now, let\'s discuss financial availability. How much is the most you are willing to spend?';
        stage = 5
        res.say(prompt).shouldEndSession(false).send();
      });
    } else if (groupSize == 2) {
      return tripCall.callTravelGroupSize(travelGroupSize).then(function(response) {
        console.log(response);
        prompt += 'Is this other person your significant other, or friend, or family?';
        stage = 4
        res.say(prompt).shouldEndSession(false).send();
      });      
    } else if (groupSize > 2) {
      return tripCall.callTravelGroupSize(travelGroupSize).then(function(response) {
        console.log(response);
        prompt += 'Are these other people friends or family?';
        stage = 4
        res.say(prompt).shouldEndSession(false).send();
      });        
    }
  }
);

/*
---GET TRAVEL GROUP TYPE---
stage 4
*/
app.intent('askGroupType', {
  'slots': {
    'GROUP_TYPES': 'LIST_OF_GROUP_TYPES',
  },
  'utterances': ['They are {GROUP_TYPES}']
},
  function(req, res) {
    var groupTypes = req.slot('GROUP_TYPES');
    var prompt = "Got it. ";

    if (groupTypes == "significant other" && groupSize > 2) {
      prompt += 'Polygamous are we? I won\'t judge. ';
    }

    return tripCall.callTravelGroupTypes(groupTypes).then(function(response) {
      console.log(response);
      prompt += 'Now, let\'s discuss financial availability. How much is the most you are willing to spend?';
      stage = 5;
      res.say(prompt).shouldEndSession(false).send();
    });
  }
);

/*
---GET FINANCIAL DATA AMOUNT---
stage 5
*/
app.intent('askFinance', {
  'slots': {
    'MONEY_AMOUNT': 'AMAZON.NUMBER',
  },
  'utterances': ['{MONEY_AMOUNT} dollars']
},
  function(req, res) {
    var moneyamount = req.slot('MONEY_AMOUNT');
    var prompt = "Okay. ";

    return tripCall.callFinanceAmount(moneyamount).then(function(response) {
      console.log(response);
      prompt += 'Is this amount you would like to spend per person, or amount you would like to spend total? Say per person or total spent.';
      stage = 6;
      res.say(prompt).shouldEndSession(false).send();
    });
  }
);


/*
---GET SPENDING WAY---
stage 6
*/
app.intent('askSpendingType', {
  'slots': {
    'SPENDING_TYPE': 'LIST_OF_SPENDING_TYPES',
  },
  'utterances': ['{SPENDING_TYPE} dollars']
},
  function(req, res) {
    var spendingtype = req.slot('SPENDING_TYPE');
    var prompt = "Understood. ";

    if (unknownDestination) {
      return tripCall.callSpendingType(spendingtype, false).then(function(response) {
        console.log(response);
        prompt += 'Would you want this trip to be international or domestic?';
        stage = 7;
        res.say(prompt).shouldEndSession(false).send();
      });
    } else {
      return tripCall.callSpendingType(spendingtype, true).then(function(response) {
        console.log(response);
        prompt = 'Okay. I am sending you the top flights on your companion app. Look through the options and take your time. Once you\'ve found a flight that you like, say Alexa, tell trip planner that I choose flight number one, two, or so on.';        
        stage = 10;

        text = ""
        for (i = 0; i < 2; i++) {
          title = "Flight Options";
          specific_card = response[i]
          text += "Option #" + (i + 1) + "\nOutbound stops: " + specific_card[0] + ". Inbound stops: " + specific_card[1] + ". Outbound departure time: " + specific_card[2] + ". Outbound departure location: " 
            + specific_card[3] + ". Outbound arrival time: " + specific_card[4] + ". Outbound arrival location: " + specific_card[5] + ". Inbound departure time: " + specific_card[6] + ". Inbound departure location: " 
            + specific_card[7] + ". Inbound arrival time: " + specific_card[8] + ". Inbound arrival location: " + specific_card[9] + ". Round-trip flight price: $" + specific_card[10] + ".\nInbound Flights: " 
            + specific_card[17][0] + " " + specific_card[15][0] + " at terminal " + specific_card[13][0] + " to " + specific_card[17][1] + " " + specific_card[15][1] + " at terminal " + specific_card[13][1]
            + " to " + specific_card[17][2] + " " + specific_card[15][2] + " at terminal " + specific_card[13][2] + ".\nOutbound flights: " + specific_card[18][0] + " " + specific_card[16][0] + " at terminal " + specific_card[14][0]
            + " to " + specific_card[18][1] + " " + specific_card[16][1] + " at terminal " + specific_card[14][1] + '.\n';
        
        }

        res.card({
          type: "Standard",
          title: title,
          text: text,
          // image: { // image is optional 
          //   smallImageUrl: cardCallUrl, // required 
          //   largeImageUrl: cardCallUrl
          // }
        });

        res.say(prompt).shouldEndSession(false).send();
      });
    }
  }
);

/*
----------------------------------UNKOWN DESTINATION INTENTS----------------------------------
*/

/*
---GET TRAVEL TYPE---
stage 7
*/
app.intent('askTravelType', {
  'slots': {
    'TRAVEL_TYPE': 'LIST_OF_TRAVEL_TYPES',
  },
  'utterances': ['{TRAVEL_TYPE}']
},
  function(req, res) {
    var traveltype = req.slot('TRAVEL_TYPE');
    var prompt = "Okay. ";

    return tripCall.callTravelType(traveltype, zip).then(function(response) {
      console.log(response);
      prompt += 'What kind of climate do you want to vacation in? Say warm or cold.';
      stage = 8;
      res.say(prompt).shouldEndSession(false).send();
    });
  }
);

/*
---GET CLIMATE TYPE---
stage 8
*/
app.intent('askClimateType', {
  'slots': {
    'CLIMATE_TYPE': 'LIST_OF_CLIMATE_TYPES',
  },
  'utterances': ['{CLIMATE_TYPE}']
},
  function(req, res) {
    var climatetype = req.slot('CLIMATE_TYPE');
    return tripCall.callClimateType(climatetype).then(function(response) {
      console.log(response);
      prompt = 'My program suggests these top three locations: ' + response + '. Which one do you prefer?';
      stage = 9;
      res.say(prompt).shouldEndSession(false).send();
    });
  }
);

/*
----------------------------------SELECTION INTENTS----------------------------------
*/
/*
---GET FLIGHT CHOICE---
stage 10
*/
app.intent('askFlightNumber', {
  'slots': {
    'FLIGHT_NUMBER': 'AMAZON.NUMBER',
  },
  'utterances': ['Flight number {FLIGHT_NUMBER}']
},
  function(req, res) {
    var flightnumber = req.slot('FLIGHT_NUMBER');
    return tripCall.callFlightNumber(flightnumber).then(function(response) {
      // console.log(response);
      prompt = 'I have sent some of the best hotel options to your companion app. If you are interested in seeing points of interest as well, say show me points of interest, otherwise say stop to exit the skill.';
      stage = 11;

      var hotel_data = response[1];
      poi_data = response[0];

      console.log(hotel_data);

      text = '';
      for (i = 0; i < 3; i++) {
        // console.log(hotel_data[i])
        if (hotel_data[i][4] != 0) {
        text += "Hotel #" + (i + 1) + "\n" 
          + "Name: " + hotel_data[i][0] + "\n"
          + "Location: " + hotel_data[i][3] + ", " + hotel_data[i][2] + "\n"
          + "Cost: $" + hotel_data[i][4] + "\n"
          + "Booking code: " + hotel_data[i][5] + "\n";
        }
      }

      res.card({
        type: "Standard",
        title: "Hotels",
        text: text,
        // image: { // image is optional 
        //   smallImageUrl: cardCallUrl, // required 
        //   largeImageUrl: cardCallUrl
        // }
      });

      res.say(prompt).shouldEndSession(false).send();
    });
  }
);

/*
---SHOW POINTS OF INTEREST---
stage 10
*/
app.intent('showPointsOfInterest', {
  'slots': {},
  'utterances': ['Show me points of interest.']
},
  function(req, res) {

    text = '';
    for (i = 0; i < 3; i++) {
      text += "POI #" + (i + 1) + "\n" 
        + "Name: " + poi_data[i][0] + "\n"
        + "Ranking: " + poi_data[i][2] + "\n"
        + "Link: " + poi_data[i][1] + "\n";
    }

    res.card({
      type: "Standard",
      title: "Points of Interest",
      text: text,
      // image: { // image is optional 
      //   smallImageUrl: cardCallUrl, // required 
      //   largeImageUrl: cardCallUrl
      // }
    });

    stage = 0;
    groupSize = 0;
    poi_data = [];
    availrange = ''
    unknownDestination = false;

    res.say("I have sent some points of interest to your companion app. Thank you for using Trip Planner.").shouldEndSession(true).send();
  }
);

/*
----------------------------------MISC INTENTS----------------------------------
*/

/*
---USER DOES NOT KNOW WHERE THEY WANT TO GO---
*/
app.intent('unsureReply', {
  'slots': {},
  'utterances': ['I don\'t know']
},
  function(req, res) {
    var prompt = 'Okay, I can help you with that! ';
    return tripCall.callDestination('unknown', false).then(function(response) {
      console.log(response);
      prompt += 'What are the start and end dates of availability?';
      stage = 1
      unknownDestination = true;
      res.say(prompt).shouldEndSession(false).send();
    });
  }
);

app.intent("AMAZON.StopIntent", {
  "slots": {},
  "utterances": []
}, 
  function(req, res) {
    stage = 0;
    groupSize = 0;
    poi_data = [];
    availrange = ''
    unknownDestination = false;
    var prompt = 'Goodbye.';;
    res.say(prompt);
  }
);

app.intent("AMAZON.CancelIntent", {
  "slots": {},
  "utterances": []
}, 
  function(req, res) {
    stage = 0;
    groupSize = 0;
    poi_data = [];
    availrange = ''
    unknownDestination = false;
    var prompt = 'Goodbye.';;
    res.say(prompt);
  }
);

app.intent('AMAZON.HelpIntent', {
  "slots": {},
  "utterances": []
},
  function(req, res) {
    var prompt = "I cannot help you right now. Sorry!"
    res.say(prompt).shouldEndSession(true);
  }
);


//hack to support custom utterances in utterance expansion string
console.log(app.utterances().replace(/\{\-\|/g, '{'));
console.log(app.schema());
module.exports = app;