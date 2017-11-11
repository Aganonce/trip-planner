var _ = require('lodash');
var rp = require('request-promise');
var apiAddress = 'https://www.echochess.xyz';

function chessEngine() {
}

// Passes in and out chess moves
chessEngine.prototype.requestEngineMove = function(playerMove, accessToken) {
  if (accessToken !== '') {
    return this.movePieceCall(playerMove, accessToken).then(
      function(response) {
        // console.log(response.body.return_play);
        return response.body.return_play;
      }
    );
  } else {
    var error_response = "I'm sorry, the alexa is having trouble understanding you right now. Please try again.";
    return error_response;
  }
};

// Calls chess api with player move to get engine move
chessEngine.prototype.movePieceCall = function(playerMove, accessToken) {
  var options = {
    method: 'GET',
    uri: apiAddress + '/move',
    qs: {
      player_move: playerMove,
      access_token: accessToken
    },
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

// Returns if chess row exists
chessEngine.prototype.requestFileExists = function(accessToken) {
  return this.fileCheckCall(accessToken).then(
    function(response) {
      return response.body.file_exists
    }
  );
};

// Calls chess api with existence of chess row
chessEngine.prototype.fileCheckCall = function(accessToken) {
  var options = {
    method: 'GET',
    uri: apiAddress + '/returning',
    qs: {
      access_token: accessToken
    },
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

// Returns if chess row exists and was deleted
chessEngine.prototype.requestFileDelete = function(accessToken) {
  return this.fileDeleteCall(accessToken).then(
    function(response) {
      return response.body.file_exists
    }
  );
};

// Calls chess api to delete existing game row
chessEngine.prototype.fileDeleteCall = function(accessToken) {
  var options = {
    method: 'GET',
    uri: apiAddress + '/new',
    qs: {
      access_token: accessToken
    },
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

// Returns difficulty level of user
chessEngine.prototype.requestDifficultyLevel = function(accessToken) {
  if (accessToken !== '') {
    return this.checkDifficultyCall(accessToken).then(
      function(response) {
        return response.body.user_difficulty
      }
    );
  } else {
    var error_response = "I'm sorry, the alexa is having trouble understanding you right now. Please try again.";
    return error_response;
  }
};

// Calls chess api to get difficulty level of user
chessEngine.prototype.checkDifficultyCall = function(accessToken) {
  var options = {
    method: 'GET',
    uri: apiAddress + '/difficulty',
    qs: {
      access_token: accessToken
    },
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

module.exports = chessEngine;