var alexa = require("alexa-app");

var request = require('request-promise');

var _ = require('lodash');
var sha512 = require('sha512')

var chessEngine = require('./call_helper');

var app = new alexa.app("chessmaster");

var chessCall = new chessEngine();

var stage = 0;

var accessId = '';

var chessFileExists = false;

var pastUserType = 'new';

var playerPieceColor;
var alexaPieceColor;

var latestBoardUrl = "https://www.echochess.xyz/board.png?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1&orientation=white";

var helpSet = [{title: 'Rules of Chess. Part 1.', instructions: 'Explosions and stuff.'}, 
  {title: 'Rules of Chess. Part 2.', instructions: 'More stuff.'}, {title: 'Rules of Chess. Part 3.', instructions: 'A lot more stuff.'}]


/*
---START SKILL and REQUEST accessToken---
---EXAMPLE (unauthenticated)---
user: "Open Chess Master."
Alexa: "To start using this skill, please use the companion app to authenticate on Amazon."
---EXAMPLE (authenticated)---
user: "Open Chess Master."
Alexa: "Hello, user. Welcome to Chess Master. Are you a new player or a returning player?"
*/
app.launch(function(req, res) {
  var prompt = 'Welcome to Chess Master. Are you a new player or a returning player?';
  var reprompt = "Say new player or returning player.";
  var reqData = req.data.session.user.accessToken;
  if (reqData == undefined) {
    prompt = 'To start using this skill, please use the companion app to authenticate on Amazon.';
    res.say(prompt).shouldEndSession(true);
    res.card({
      type: "LinkAccount"
    });
  } else {
    var amznProfileURL = 'https://api.amazon.com/user/profile?access_token=';
    amznProfileURL += reqData;
    var hash = sha512(req.data.session.user.userId);
    accessId = hash.toString('hex');
    console.log(accessId);

    return request(amznProfileURL, function(error, response, body) {
      console.log('connected: ' + response.statusCode);
      if (response.statusCode == 200) {
        var profile = JSON.parse(body);
        var firstName = profile.name.split(" ")[0];
        console.log("Hello " + firstName + '. ' + prompt);
        res.say("Hello " + firstName + '. ' + prompt).reprompt(reprompt).shouldEndSession(false).send();
      } else {
        res.say("I can't connect to Amazon Profile Service right now, try again later").shouldEndSession(true).send();
      }
    });
  }
});

/*
---GETS USER TYPE---
---EXAMPLE---
user: "I am a new player"
Alexa: "Welcome new player. Choose your side of the board. Do you want the white pieces or the black pieces?"
*/
app.intent('playerTypeIntent', {
  'slots': {
    'USERTYPE': 'LIST_OF_USER_TYPES'
  },
  'utterances': ['{|I\'m|I am} {|a} {-|USERTYPE} {|player}']
},
  function(req, res) {
    //get the slot
    var userType = req.slot('USERTYPE');

    var reprompt = 'Say white pieces or black pieces';
    // var prompt = 'I don\'t think I heard you correctly. Are you a new player or a returning player?';
    var prompt = 'I don\'t think I heard you correctly.';

    if (stage == 0 || stage == 2) {
      //Correct stage.
      if (_.isEmpty(userType)) {
        // prompt = 'I don\'t think I heard you correctly. Are you a new player or a returning player?';
        prompt = 'I don\'t think I heard you correctly.';
        reprompt = 'Say new player or returning player.';

        res.say(prompt).reprompt(reprompt).shouldEndSession(false);
      } else if (userType == 'new') {
        //Delete previously existing game file if it exists
        return chessCall.requestFileDelete(accessId).then(function(deleteVar) {
          prompt = "Welcome new player. Choose your side of the board. Do you want the white pieces or the black pieces?"

          stage = 1;

          playerPieceColor = '';
          alexaPieceColor = '';

          latestBoardUrl = "https://www.echochess.xyz/board.png?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1&orientation=white";

          pastUserType = userType;  

          res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
        });
      } else if (userType == 'returning') {
        // Check if game files already exist.
        console.log("making returning player claim");

        return chessCall.requestFileExists(accessId).then(function(fileExists) {
          if (!fileExists) {
            console.log("No chess log exists for returning player.");
            prompt = "Oh dear! I have no record of a unended game. Sorry! We will have to start a new game. Do you want the white pieces or the black pieces?";

            userType = 'new';

            stage = 1;

            playerPieceColor = '';
            alexaPieceColor = '';

            latestBoardUrl = "https://www.echochess.xyz/board.png?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1&orientation=white";

            pastUserType = userType;  
          } else {
            console.log("File log DOES exists for returning player!");
            prompt = "Oh yes! I remember you. Your move.";
            reprompt = '<break time="3s"/>';

            stage = 2;

            chessFileExists = true;
          }

          pastUserType = userType;  

          res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
        });
      } else {
        // prompt = 'I don\'t think I heard you correctly. Are you a new player or a returning player?';
        prompt = 'I don\'t think I heard you correctly.';

        reprompt = 'Say new player or returning player.';

        res.say(prompt).reprompt(reprompt).shouldEndSession(false);
      }
    } else {
      //User attempting to change returning/new status
      prompt = 'You already said you were a ' + pastUserType + ' player!';

      if (stage == 1) {
        prompt += " Do you want the white pieces or the black pieces?";
      }

      res.say(prompt).shouldEndSession(false);
    }
  }
);

/*
---GETS PLAYER PIECE COLOR---
NOTE: Give option for Alexa to choose?
---EXAMPLE---
user: "I want the white pieces."
Alexa: "Welcome new player. Choose your side of the board. Do you want the white pieces or the black pieces?"
*/
app.intent('pieceColorIntent', {
  'slots': {
    'PIECECOLOR': 'LIST_OF_PIECE_COLORS'
  },
  'utterances': ["{|I want} {|the} {-|PIECECOLOR} {side|pieces}"]
},
  function(req, res) {
    //get the slot
    var pieceColor = req.slot('PIECECOLOR');
    var reprompt = 'Make your first move.';
    // var prompt = 'I\'m sorry, I don\'t think I heard you correctly. Did you say the white pieces or the black pieces?';
    var prompt = 'I\'m sorry, I don\'t think I heard you correctly.';

    if (stage == 1) {
      //Correct stage.
      if (_.isEmpty(pieceColor)) {
        // prompt = 'I\'m sorry, I don\'t think I heard you correctly. Did you say the white pieces or the black pieces?';
        prompt = 'I\'m sorry, I don\'t think I heard you correctly.';

        res.say(prompt).shouldEndSession(false).send();
      } else if (pieceColor == 'white') {
        playerPieceColor = pieceColor;
        alexaPieceColor = 'black';

        //prompt = 'Okay. I will be the ' + alexaPieceColor + ' pieces. Make your first move.';

        return chessCall.requestEngineMove('white', accessId).then(function(alexaMove) {
          console.log('Making call for white.');
          var subList = alexaMove.split('|');
          prompt = subList[0];

          stage = 2;

          var cardImage = subList[1] || ''
          if (cardImage != '') {
            var cardCallUrl = "https://www.echochess.xyz/board.png?fen=" + cardImage + '&orientation=' + playerPieceColor;
            latestBoardUrl = cardCallUrl;
            res.card({
              type: "Standard",
              title: "Chess Master", // this is not required for type Simple or Standard 
              text: "You are the white pieces. Alexa is the black pieces.",
              image: { // image is optional 
                smallImageUrl: cardCallUrl, // required 
                largeImageUrl: cardCallUrl
              }
            });
          }

          res.say(prompt).shouldEndSession(false).send();
        }).catch(function(err) {
          console.log(err);
          stage = 1;
          playerPieceColor = '';
          alexaPieceColor = '';
          prompt = 'I\'m sorry. I\'m not quite sure what you meant. Can you please repeat that?';
          res.say(prompt).shouldEndSession(false).send();
        });

        stage = 2;
      } else if (pieceColor == 'black') {
        playerPieceColor = pieceColor;
        alexaPieceColor = 'white';

        //prompt = 'Okay. I will be the ' + alexaPieceColor + ' pieces. Let me make my first move.';

        return chessCall.requestEngineMove('black', accessId).then(function(alexaMove) {
          console.log('Making call for black.');

          stage = 2;

          var prompt = alexaMove;
          var promptArr = [];
          var subPromptArr = [];

          var cardTitle = 'Chess Master';

          var cardText = '';

          var cardImage = '';
          if(alexaMove.indexOf(':') !== -1) {
            promptArr = alexaMove.split(':');

            prompt = 'I will move ' + promptArr[0] + ' to ' + promptArr[1] + '.';

            if(promptArr[1].indexOf('|') !== -1) {
              subPromptArr = promptArr[1].split('|');

              prompt = promptArr[0] + '. I will move ' + subPromptArr[0] + ' to ' + subPromptArr[1] + '.';

              cardText = 'You are the black pieces. Alexa is the white pieces.\n Alexa: ' + subPromptArr[0] + '|' + subPromptArr[1] + '.';
              cardImage = subPromptArr[2];
            }
          }

          if (cardImage != '') {
            var cardCallUrl = "https://www.echochess.xyz/board.png?fen=" + cardImage + '&orientation=' + playerPieceColor;
            latestBoardUrl = cardCallUrl;
            res.card({
              type: "Standard",
              title: cardTitle,
              text: cardText,
              image: {
                smallImageUrl: cardCallUrl, // required
                largeImageUrl: cardCallUrl
              }
            });
          } else {
            res.card(cardTitle, cardText);
          }


          res.say(prompt).shouldEndSession(false).send();
        }).catch(function(err) {
          console.log(err);
          stage = 1;
          playerPieceColor = '';
          alexaPieceColor = '';
          prompt = 'I\'m sorry. I\'m not quite sure what you meant. Can you please repeat that?';
          res.say(prompt).shouldEndSession(false).send();
        });

        stage = 2;
      } else {
        // prompt = 'I\'m sorry, I don\'t think I heard you correctly. Did you say the white pieces or the black pieces?';
        stage = 1;
        playerPieceColor = '';
        alexaPieceColor = '';
        prompt = 'I\'m sorry, I don\'t think I heard you correctly. Did you say the white pieces or the black pieces?';

        res.say(prompt).reprompt(reprompt).shouldEndSession(false);
      }
    } else if (stage == 0) {
      //Player attempts to choose color piece ahead of specifying whether or not they are a new or returning player.
      prompt = "Slow down there! Let\'s go through this in an orderly fashion. Are you a new player or a returning player?";
      reprompt = 'Say you are a new or returning player.';

      stage = 0;

      res.say(prompt).reprompt(reprompt).shouldEndSession(false);
    } else {
      //Player attempts to go back and change the color of their pieces.
      prompt = "Hey there! We have already decided on sides. I am the " + alexaPieceColor + " pieces and you\'re the " + playerPieceColor + " pieces. What is your move?";
      reprompt = 'Now go ahead and make a move.';

      res.say(prompt).reprompt(reprompt).shouldEndSession(false);
    }
  }
);

/*
---GETS PLAYER MOVE---
---EXAMPLE---
user: "Pawn to E4."
Alexa: "Pawn to E5."
*/
app.intent('pieceMoveIntent', {
  'slots': {
    'PIECETYPE': 'LIST_OF_PIECE_TYPES',
    'PIECEPOSITION': 'LIST_OF_PIECE_POSITIONS'
  },
  'utterances': ['{|move|I want to move} {|my} {-|PIECETYPE} {|to} {-|PIECEPOSITION}']
},
  function(req, res) {
    //get the slot
    var pieceType = moveFormat(req.slot('PIECETYPE'));
    var piecePosition = moveFormat(req.slot('PIECEPOSITION'));

    if (pieceType != null && piecePosition != null) {

      pieceType = pieceType.replace(/\s+/g, '').toUpperCase();

      piecePosition = piecePosition.replace(/\s+/g, '').toUpperCase();

      var playerMove = pieceType + "|" + piecePosition;

      console.log(playerMove);

      var reprompt = '<break time="3s"/>';

      if (stage == 2) {
        //Correct stage.
        if (_.isEmpty(pieceType) || _.isEmpty(piecePosition)) {
          var prompt = 'I\'m sorry. I didn\'t hear your move correctly. Say it again please.';

          res.say(prompt).reprompt(reprompt).shouldEndSession(false);
        } else {
          var specifyMove = playerMove;
          //Style castle-kingside/castle-queenside moves to chess engine input.
          if ((pieceType == 'CASTLE' && piecePosition == 'KINGSIDE') || (pieceType == 'CASTLEKING' && piecePosition == 'SIDE')) {
            playerMove = '0-0|A';

            specifyMove = 'Castle Kingside';
          } else if ((pieceType == 'CASTLE' && piecePosition == 'QUEENSIDE') || (pieceType == 'CASTLEQUEEN' && piecePosition == 'SIDE')) {
            playerMove = '0-0-0|A';

            specifyMove = 'Castle Queenside';
          }

          console.log("Making a move of " + playerMove + " from the index.js.");

          //Make a move.
          return chessCall.requestEngineMove(playerMove, accessId).then(function(alexaMove) {
            console.log(alexaMove);

            var moveSubList = alexaMove.split('|');

            console.log(moveSubList[0] + ' => ' + moveSubList[1] + ' => ' + moveSubList[2]);

            if (searchWord('win', moveSubList[1]) || searchWord('lose', moveSubList[0]) || searchWord('draw', moveSubList[0])) {
                return chessCall.requestFileDelete(accessId).then(function(deleteVar) {
                  
                  if (searchWord('win', moveSubList[1])) {
                    cardImage = moveSubList[2];
                    prompt = 'I will move ' + moveSubList[0] + ' to ' + moveSubList[1] + ' That was the game! If you want to start a new game, say Alexa start Chess Master.';
                  } else if (searchWord('lose', moveSubList[0])) {
                    cardImage = moveSubList[1];
                    prompt = 'I lose. That was the game! If you want to start a new game, say Alexa start Chess Master.';
                  } else {
                    cardImage = moveSubList[1];
                    prompt = 'The game is a draw. That was the game! If you want to start a new game, say Alexa start Chess Master.';
                  }

                  if (searchWord('lose', moveSubList[0])) {
                    if (cardImage != '') {
                      var cardCallUrl = "https://www.echochess.xyz/board.png?fen=" + cardImage + '&orientation=' + playerPieceColor;
                      latestBoardUrl = "https://www.echochess.xyz/board.png?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1&orientation=white";
                      res.card({
                        type: "Standard",
                        title: "Chess Master",
                        text: "You won the chess game!",
                        image: {
                          smallImageUrl: cardCallUrl, // required
                          largeImageUrl: cardCallUrl
                        }
                      });
                    } else {
                      res.card("Chess Master", "You won the chess game!");
                    }
                  } else if (searchWord('win', moveSubList[1])) {

                    if (cardImage != '') {
                      var cardCallUrl = "https://www.echochess.xyz/board.png?fen=" + cardImage + '&orientation=' + playerPieceColor;
                      latestBoardUrl = "https://www.echochess.xyz/board.png?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1&orientation=white";
                      res.card({
                        type: "Standard",
                        title: "Chess Master",
                        text: "You lost the chess game.",
                        image: {
                          smallImageUrl: cardCallUrl, // required
                          largeImageUrl: cardCallUrl
                        }
                      });
                    } else {
                      res.card("Chess Master", "You lost the chess game.");
                    }

                  } else {

                    if (cardImage != '') {
                      var cardCallUrl = "https://www.echochess.xyz/board.png?fen=" + cardImage + '&orientation=' + playerPieceColor;
                      latestBoardUrl = "https://www.echochess.xyz/board.png?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1&orientation=white";
                      res.card({
                        type: "Standard",
                        title: "Chess Master",
                        text: "The game is a draw.",
                        image: {
                          smallImageUrl: cardCallUrl, // required
                          largeImageUrl: cardCallUrl
                        }
                      });
                    } else {
                      res.card("Chess Master", "The game is a draw.");
                    }

                  }

                  stage = 0;
                  playerPieceColor = '';
                  alexaPieceColor = '';
                  pastUserType = 'new';

                  res.say(prompt).shouldEndSession(true).send();
                });
            } else {
              var prompt = alexaMove;
              var promptArr = [];

              var cardTitle = 'Chess Master';
              var cardText = 'You: ' + specifyMove.toLowerCase() + '. Alexa: ' + alexaMove + '.';
              var cardImage = '';

              if(alexaMove.indexOf('|') !== -1) {
                promptArr = alexaMove.split('|');

                prompt = 'I will move ' + promptArr[0] + ' to ' + promptArr[1] + '.';

                cardText = 'You: ' + specifyMove.toLowerCase() + '. Alexa: ' + promptArr[0].toLowerCase() + '|' + promptArr[1].toLowerCase() + '.';

                cardImage = promptArr[2];
              }

              if (cardImage != '') {
                var cardCallUrl = "https://www.echochess.xyz/board.png?fen=" + cardImage + '&orientation=' + playerPieceColor;
                latestBoardUrl = cardCallUrl;
                res.card({
                  type: "Standard",
                  title: cardTitle,
                  text: cardText,
                  image: {
                    smallImageUrl: cardCallUrl, // required
                    largeImageUrl: cardCallUrl
                  }
                });
              } else {
                res.card(cardTitle, cardText);
              }

              res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
            }
          }).catch(function(err) {
            console.log(err);
            // var prompt = 'You can\'t say ' + pieceType + ' to ' + piecePosition + '.';
            // var prompt = "There was an error with my response. Rest assured, a ticket has automatically been submitted.";
            var prompt = "The move you made is not valid. Please try again.";
            res.card("Chess Master", "You: " + playerMove + ' Alexa: That is not a valid move.');
            res.say(prompt).shouldEndSession(false).send();
          });
        }
      } else if (stage == 0) {
        //User is reentering game after lengthy pause. 
        var reqData = req.data.session.user.accessToken || '';
        var hash = sha512(reqData);
        accessId = hash.toString('hex');

        return chessCall.requestFileExists(accessId).then(function(fileExists) {
          if (fileExists == 0) {
            //No game exists. Start a new one.
            var prompt = 'We haven\'t even set up the game yet! What side of the board do you want? Say the white pieces or the black pieces.';
            reprompt = 'Say the white pieces or the black pieces.';
            stage = 1;
            pastUserType = 'new';

            res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
          } else {
            //Game exists. Pick up where last left off.
            chessFileExists = true;

            var specifyMove = playerMove;

            //Style castle-kingside/castle-queenside moves to chess engine input.
            if ((pieceType == 'CASTLE' && piecePosition == 'KINGSIDE') || (pieceType == 'CASTLEKING' && piecePosition == 'SIDE')) {
              playerMove = '0-0|A';

              specifyMove = 'Castle Kingside';
            } else if ((pieceType == 'CASTLE' && piecePosition == 'QUEENSIDE') || (pieceType == 'CASTLEQUEEN' && piecePosition == 'SIDE')) {
              playerMove = '0-0-0|A';

              specifyMove = 'Castle Queenside';
            }

            //Make a move.
            return chessCall.requestEngineMove(playerMove, accessId).then(function(alexaMove) {
              console.log("Jumping right in! Alexa's move is " + alexaMove);

              var moveSubList = alexaMove.split();

              if (searchWord('win', moveSubList[1]) || searchWord('lose', moveSubList[0]) || searchWord('draw', moveSubList[0])) {
                return chessCall.requestFileDelete(accessId).then(function(deleteVar) {
                  cardImage = moveSubList[1];

                  if (searchWord('win', moveSubList[1])) {
                    cardImage = moveSubList[2];
                    prompt = 'I will move ' + moveSubList[0] + ' to ' + moveSubList[1] + ' That was the game! If you want to start a new game, say Alexa start Chess Master.';
                  } else if (searchWord('lose', moveSubList[0])) {
                    cardImage = moveSubList[1];
                    prompt = 'I lose. That was the game! If you want to start a new game, say Alexa start Chess Master.';
                  } else {
                    cardImage = moveSubList[1];
                    prompt = 'The game is a draw. That was the game! If you want to start a new game, say Alexa start Chess Master.';
                  }
                  
                  if (searchWord('lose', moveSubList[0])) {

                    if (cardImage != '') {
                      var cardCallUrl = "https://www.echochess.xyz/board.png?fen=" + cardImage + '&orientation=' + playerPieceColor;
                      latestBoardUrl = "https://www.echochess.xyz/board.png?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1&orientation=white";
                      res.card({
                        type: "Standard",
                        title: "Chess Master",
                        text: "You won the chess game!",
                        image: {
                          smallImageUrl: cardCallUrl, // required
                          largeImageUrl: cardCallUrl
                        }
                      });
                    } else {
                      res.card("Chess Master", "You won the chess game!");
                    }

                  } else if (searchWord('win', moveSubList[1])) {

                    if (cardImage != '') {
                      var cardCallUrl = "https://www.echochess.xyz/board.png?fen=" + cardImage + '&orientation=' + playerPieceColor;
                      latestBoardUrl = "https://www.echochess.xyz/board.png?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1&orientation=white";
                      res.card({
                        type: "Standard",
                        title: "Chess Master",
                        text: "You lost the chess game.",
                        image: {
                          smallImageUrl: cardCallUrl, // required
                          largeImageUrl: cardCallUrl
                        }
                      });
                    } else {
                      res.card("Chess Master", "You lost the chess game.");
                    }

                  } else {

                    if (cardImage != '') {
                      var cardCallUrl = "https://www.echochess.xyz/board.png?fen=" + cardImage + '&orientation=' + playerPieceColor;
                      latestBoardUrl = "https://www.echochess.xyz/board.png?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1&orientation=white";
                      res.card({
                        type: "Standard",
                        title: "Chess Master",
                        text: "The game is a draw.",
                        image: {
                          smallImageUrl: cardCallUrl, // required
                          largeImageUrl: cardCallUrl
                        }
                      });
                    } else {
                      res.card("Chess Master", "The game is a draw.");
                    }

                  }

                  stage = 0;
                  playerPieceColor = '';
                  alexaPieceColor = '';
                  pastUserType = 'new';

                  res.say(prompt).shouldEndSession(true).send();
                });
              } else {
              var prompt = alexaMove;
              var promptArr = [];

              var cardTitle = 'Chess Master';
              var cardText = 'You: ' + specifyMove.toLowerCase() + '. Alexa: ' + alexaMove + '.';
              var cardImage = '';

              if(alexaMove.indexOf('|') !== -1) {
                promptArr = alexaMove.split('|');

                prompt = 'I will move ' + promptArr[0] + ' to ' + promptArr[1] + '.';

                cardText = 'You: ' + specifyMove.toLowerCase() + '. Alexa: ' + promptArr[0].toLowerCase() + '|' + promptArr[1].toLowerCase() + '.';

                cardImage = promptArr[2];
              }

              if (cardImage != '') {
                var cardCallUrl = "https://www.echochess.xyz/board.png?fen=" + cardImage + '&orientation=' + playerPieceColor;
                latestBoardUrl = cardCallUrl;
                res.card({
                  type: "Standard",
                  title: cardTitle,
                  text: cardText,
                  image: {
                    smallImageUrl: cardCallUrl, // required
                    largeImageUrl: cardCallUrl
                  }
                });
              } else {
                res.card(cardTitle, cardText);
              }

              res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
              }
            }).catch(function(err) {
              console.log(err);
              // var prompt = 'You can\'t say ' + pieceType + ' to ' + piecePosition + '.';
              // var prompt = "There was an error with my response. Rest assured, a ticket has automatically been submitted.";
              var prompt = "The move you made is not valid. Please try again.";
              res.card("Chess Master", "You: " + playerMove + ' Alexa: That is not a valid move.');
              res.say(prompt).shouldEndSession(false).send();
            });
          }
        });
      } else {
        //Player preemptively attempts to make a move. Probably stage 1.
        var prompt = 'Wait! We haven\'t started playing yet!'
        reprompt = 'Do you want the white pieces or the black pieces?';
        res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
      }
    } else {
      var prompt = 'I\'m sorry. I didn\'t hear your move correctly. Say it again please.';
      
      res.say(prompt).reprompt(reprompt).shouldEndSession(false);
    }
  }
);

/*
---GETS PLAYER PROMOTION---
---EXAMPLE---
user: "I want a queen"
Alexa: "King to A4."
*/
app.intent('piecePromoteIntent', {
  'slots': {
    'PIECEPROMOTION': 'LIST_OF_PIECE_PROMOTIONS',
  },
  'utterances': ['{|I want|Give me} {|a} {-|PIECEPROMOTION}']
},
  function(req, res) {
    //get the slot
    var piecePromote = moveFormat(req.slot('PIECEPROMOTION'));

    if (piecePromote != null) {
      piecePromote = piecePromote.replace(/\s+/g, '').toUpperCase();

      var playerMove = piecePromote;

      console.log(playerMove);

      var reprompt = '<break time="3s"/>';
      if (stage == 2) {
        //Correct stage.
        if (_.isEmpty(piecePromote)) {
          var prompt = 'I\'m sorry. I didn\'t hear your move correctly. Say it again please.';

          res.say(prompt).reprompt(reprompt).shouldEndSession(false);
        } else {
          var specifyMove = 'Convert pawn into ' + playerMove;

          console.log("Making a move of " + playerMove + " from the index.js.");

          //Make a move.
          return chessCall.requestEngineMove(playerMove, accessId).then(function(alexaMove) {
            console.log(alexaMove);

            var moveSubList = alexaMove.split('|');

            if (searchWord('win', moveSubList[1]) || searchWord('lose', moveSubList[0]) || searchWord('draw', moveSubList[0])) {
              return chessCall.requestFileDelete(accessId).then(function(deleteVar) {
                cardImage = moveSubList[1];
                
                if (searchWord('win', moveSubList[1])) {
                  cardImage = moveSubList[2];
                  prompt = 'I will move ' + moveSubList[0] + ' to ' + moveSubList[1] + ' That was the game! If you want to start a new game, say Alexa start Chess Master.';
                } else if (searchWord('lose', moveSubList[0])) {
                  cardImage = moveSubList[1];
                  prompt = 'I lose. That was the game! If you want to start a new game, say Alexa start Chess Master.';
                } else {
                  cardImage = moveSubList[1];
                  prompt = 'The game is a draw. That was the game! If you want to start a new game, say Alexa start Chess Master.';
                }

                if (searchWord('lose', moveSubList[0])) {

                  if (cardImage != '') {
                    var cardCallUrl = "https://www.echochess.xyz/board.png?fen=" + cardImage + '&orientation=' + playerPieceColor;
                    latestBoardUrl = "https://www.echochess.xyz/board.png?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1&orientation=white";
                    res.card({
                      type: "Standard",
                      title: "Chess Master",
                      text: "You won the chess game!",
                      image: {
                        smallImageUrl: cardCallUrl, // required
                        largeImageUrl: cardCallUrl
                      }
                    });
                  } else {
                    res.card("Chess Master", "You won the chess game!");
                  }

                } else if (searchWord('win', moveSubList[1])) {

                  if (cardImage != '') {
                    var cardCallUrl = "https://www.echochess.xyz/board.png?fen=" + cardImage + '&orientation=' + playerPieceColor;
                    latestBoardUrl = "https://www.echochess.xyz/board.png?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1&orientation=white";
                    res.card({
                      type: "Standard",
                      title: "Chess Master",
                      text: "You lost the chess game.",
                      image: {
                        smallImageUrl: cardCallUrl, // required
                        largeImageUrl: cardCallUrl
                      }
                    });
                  } else {
                    res.card("Chess Master", "You lost the chess game.");
                  }

                } else {

                  if (cardImage != '') {
                    var cardCallUrl = "https://www.echochess.xyz/board.png?fen=" + cardImage + '&orientation=' + playerPieceColor;
                    latestBoardUrl = "https://www.echochess.xyz/board.png?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1&orientation=white";
                    res.card({
                      type: "Standard",
                      title: "Chess Master",
                      text: "The game is a draw.",
                      image: {
                        smallImageUrl: cardCallUrl, // required
                        largeImageUrl: cardCallUrl
                      }
                    });
                  } else {
                    res.card("Chess Master", "The game is a draw.");
                  }

                }

                stage = 0;
                playerPieceColor = '';
                alexaPieceColor = '';
                pastUserType = 'new';

                res.say(prompt).shouldEndSession(true).send();
              });
            } else {
              var prompt = alexaMove;
              var promptArr = [];

              var cardTitle = 'Chess Master';
              var cardText = 'You: ' + specifyMove.toLowerCase() + '. Alexa: ' + alexaMove + '.';
              var cardImage = '';

              if(alexaMove.indexOf('|') !== -1) {
                promptArr = alexaMove.split('|');

                prompt = 'I will move ' + promptArr[0] + ' to ' + promptArr[1] + '.';

                cardText = 'You: ' + specifyMove.toLowerCase() + '. Alexa: ' + promptArr[0].toLowerCase() + '|' + promptArr[1].toLowerCase() + '.';

                cardImage = promptArr[2];
              }

              if (cardImage != '') {
                var cardCallUrl = "https://www.echochess.xyz/board.png?fen=" + cardImage + '&orientation=' + playerPieceColor;
                latestBoardUrl = cardCallUrl;
                res.card({
                  type: "Standard",
                  title: cardTitle,
                  text: cardText,
                  image: {
                    smallImageUrl: cardCallUrl, // required
                    largeImageUrl: cardCallUrl
                  }
                });
              } else {
                res.card(cardTitle, cardText);
              }

              res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
            }
          }).catch(function(err) {
            console.log(err);
            // var prompt = 'You can\'t say ' + pieceType + ' to ' + piecePosition + '.';
            // var prompt = "There was an error with my response. Rest assured, a ticket has automatically been submitted.";
            var prompt = "The move you made is not valid. Please try again.";
            res.card("Chess Master", "You: " + playerMove + ' Alexa: That is not a valid move.');
            res.say(prompt).shouldEndSession(false).send();
          });
        }
      } else if (stage == 0) {
        //User is reentering game after lengthy pause. 
        var reqData = req.data.session.user.accessToken || '';
        var hash = sha512(reqData);
        accessId = hash.toString('hex');

        return chessCall.requestFileExists(accessId).then(function(fileExists) {
          if (fileExists == 0) {
            //No game exists. Start a new one.
            var prompt = 'We haven\'t even set up the game yet! What side of the board do you want? Say the white pieces or the black pieces.';
            reprompt = 'Say the white pieces or the black pieces.';
            stage = 1;
            pastUserType = 'new';

            res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
          } else {
            //Game exists. Pick up where last left off.
            chessFileExists = true;

            var specifyMove = 'Convert pawn into ' + playerMove;

            //Make a move.
            return chessCall.requestEngineMove(playerMove, accessId).then(function(alexaMove) {
              console.log("Jumping right in! Alexa's move is " + alexaMove);

              var moveSubList = alexaMove.split('|');

              if (searchWord('win', moveSubList[1]) || searchWord('lose', moveSubList[0]) || searchWord('draw', moveSubList[0])) {
                return chessCall.requestFileDelete(accessId).then(function(deleteVar) {
                  cardImage = moveSubList[1];
                  
                  if (searchWord('win', moveSubList[1])) {
                    cardImage = moveSubList[2];
                    prompt = 'I will move ' + moveSubList[0] + ' to ' + moveSubList[1] + ' That was the game! If you want to start a new game, say Alexa start Chess Master.';
                  } else if (searchWord('lose', moveSubList[0])) {
                    cardImage = moveSubList[1];
                    prompt = 'I lose. That was the game! If you want to start a new game, say Alexa start Chess Master.';
                  } else {
                    cardImage = moveSubList[1];
                    prompt = 'The game is a draw. That was the game! If you want to start a new game, say Alexa start Chess Master.';
                  }

                  if (searchWord('lose', moveSubList[0])) {

                    if (cardImage != '') {
                      var cardCallUrl = "https://www.echochess.xyz/board.png?fen=" + cardImage + '&orientation=' + playerPieceColor;
                      latestBoardUrl = "https://www.echochess.xyz/board.png?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1&orientation=white";
                      res.card({
                        type: "Standard",
                        title: "Chess Master",
                        text: "You won the chess game!",
                        image: {
                          smallImageUrl: cardCallUrl, // required
                          largeImageUrl: cardCallUrl
                        }
                      });
                    } else {
                      res.card("Chess Master", "You won the chess game!");
                    }

                  } else if (searchWord('win', moveSubList[1])) {

                    if (cardImage != '') {
                      var cardCallUrl = "https://www.echochess.xyz/board.png?fen=" + cardImage + '&orientation=' + playerPieceColor;
                      latestBoardUrl = "https://www.echochess.xyz/board.png?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1&orientation=white";
                      res.card({
                        type: "Standard",
                        title: "Chess Master",
                        text: "You lost the chess game.",
                        image: {
                          smallImageUrl: cardCallUrl, // required
                          largeImageUrl: cardCallUrl
                        }
                      });
                    } else {
                      res.card("Chess Master", "You lost the chess game.");
                    }

                  } else {

                    if (cardImage != '') {
                      var cardCallUrl = "https://www.echochess.xyz/board.png?fen=" + cardImage + '&orientation=' + playerPieceColor;
                      latestBoardUrl = "https://www.echochess.xyz/board.png?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1&orientation=white";
                      res.card({
                        type: "Standard",
                        title: "Chess Master",
                        text: "The game is a draw.",
                        image: {
                          smallImageUrl: cardCallUrl, // required
                          largeImageUrl: cardCallUrl
                        }
                      });
                    } else {
                      res.card("Chess Master", "The game is a draw.");
                    }

                  }

                  stage = 0;
                  playerPieceColor = '';
                  alexaPieceColor = '';
                  pastUserType = 'new';

                  res.say(prompt).shouldEndSession(true).send();
                });
              } else {
                var prompt = alexaMove;
                var promptArr = [];

                var cardTitle = 'Chess Master';
                var cardText = 'You: ' + specifyMove.toLowerCase() + '. Alexa: ' + alexaMove + '.';
                var cardImage = '';


                if(alexaMove.indexOf('|') !== -1) {
                  promptArr = alexaMove.split('|');

                  prompt = 'I will move ' + promptArr[0] + ' to ' + promptArr[1] + '.';

                  cardText = 'You: ' + specifyMove.toLowerCase() + '. Alexa: ' + promptArr[0].toLowerCase() + '|' + promptArr[1].toLowerCase() + '.';

                  cardImage = promptArr[2];
                }

                if (cardImage != '') {
                  var cardCallUrl = "https://www.echochess.xyz/board.png?fen=" + cardImage + '&orientation=' + playerPieceColor;
                  latestBoardUrl = cardCallUrl;
                  res.card({
                    type: "Standard",
                    title: cardTitle,
                    text: cardText,
                    image: {
                      smallImageUrl: cardCallUrl, // required
                      largeImageUrl: cardCallUrl
                    }
                  });
                } else {
                  res.card(cardTitle, cardText);
                }

                res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
              }
            }).catch(function(err) {
              console.log(err);
              // var prompt = 'You can\'t say ' + pieceType + ' to ' + piecePosition + '.';
              // var prompt = "There was an error with my response. Rest assured, a ticket has automatically been submitted.";
              var prompt = "The move you made is not valid. Please try again.";
              res.card("Chess Master", "You: " + playerMove + ' Alexa: That is not a valid move.');
              res.say(prompt).shouldEndSession(false).send();
            });
          }
        });
      } else {
        //Player preemptively attempts to make a move. Probably stage 1.
        var prompt = 'Wait! We haven\'t started playing yet!'
        reprompt = 'Do you want the white pieces or the black pieces?';
        res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
      }
    } else {
      if (stage == 1) {
        res.say("I'm sorry, what color of pieces do you want? Say I want the white pieces or I want the black pieces.").reprompt(reprompt).shouldEndSession(false);
      } else if (stage == 2) {
        res.say("I'm sorry, piece do you want to promote to?").reprompt(reprompt).shouldEndSession(false);
      } else {
        res.say("I'm sorry, could you repeat that?").reprompt(reprompt).shouldEndSession(false);
      }
    }
  }
);

/*
---RESET---
---EXAMPLE---
user: "reset."
Alexa: "I\'ve reset the board."
*/
app.intent('resetIntent', {
  'utterances': ['reset {|the board|the game}']
},
  function(req, res) {
    var reqData = req.data.session.user.accessToken;

    if (reqData == undefined) {
      prompt = 'To start using this skill, please use the companion app to authenticate on Amazon.';
      res.say(prompt).shouldEndSession(true).send();
      res.card({
        type: "LinkAccount"
      });
    } else {
      var hash = sha512(req.data.session.user.userId);
      accessId = hash.toString('hex');

      return chessCall.requestFileDelete(accessId).then(function(deleteVar) {
        console.log("We got back " + deleteVar);

        var prompt = 'I\'ve reset the board.';

        stage = 0;
        playerPieceColor = '';
        alexaPieceColor = '';
        pastUserType = 'new';

        latestBoardUrl = "https://www.echochess.xyz/board.png?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1&orientation=white";

        res.card({
          type: "Standard",
          title: "Chess Master", // this is not required for type Simple or Standard 
          text: "The chess board was reset.",
          image: { // image is optional 
            smallImageUrl: latestBoardUrl // required 
          }
        });

        res.say(prompt).shouldEndSession(true).send();
      });
    }
  }
);


/*
---SET DIFFICULTY---
---EXAMPLE---
user: "Set difficulty to 6."
Alexa: "Difficulty has been set to six."
*/
app.intent('difficultyTypeIntent', {
  'slots': {
    'DIFFICULTYTYPE': 'LIST_OF_DIFFICUTLY_TYPES'
  },
  'utterances': ['{|set} {difficulty|the difficulty} {|to} {-|DIFFICULTYTYPE}']
},
  function(req, res) {
    var diffNum = req.slot('DIFFICULTYTYPE');
    var numberVal = '1';
    switch (diffNum) {
      case 'ONE':
        numberVal = '1';
        break;
      case 'TWO':
        numberVal = '2';
        break;
      case 'THREE':
        numberVal = '3';
        break;
      case 'FOUR':
        numberVal = '4';
        break;
      case 'FIVE':
        numberVal = '5';
        break;
      case 'SIX':
        numberVal = '6';
        break;
      default:
        numberVal = '1';
    }

    var difficultyCall = 'difficulty|' + diffNum;

    var prompt = difficultyCall;
    return chessCall.requestEngineMove(difficultyCall, accessId).then(function(alexaMove) {
      prompt = alexaMove;

      res.card("Chess Master", prompt);

      res.say(prompt).shouldEndSession(true).send();
    });
  }
);

/*
---CHECK DIFFICULTY---
---EXAMPLE---
user: "What is the difficulty?"
Alexa: "Difficulty is set to six."
*/
app.intent('checkDifficultyIntent', {
  'utterances': ['what is {|the} difficulty']
},
  function(req, res) {

    var prompt = "The difficulty is set to three."
    return chessCall.requestDifficultyLevel(accessId).then(function(difficultyLevel) {
      prompt = difficultyLevel;

      res.card("Chess Master", prompt);

      res.say(prompt).shouldEndSession(true).send();
    });
  }
);

/*
---HELP---
---EXAMPLE---
user: "Stop."
Alexa: "Goodbye."
*/
// app.intent('AMAZON.StopIntent', {
//   'utterances': ['stop']
// },
//   function(req, res) {
//     var prompt = 'Goodbye.';

//     res.say(prompt).shouldEndSession(true);
//   }
// );

app.intent("AMAZON.StopIntent", {
  "slots": {},
  "utterances": []
}, 
  function(req, res) {
    var prompt = 'Goodbye.';;
    res.say(prompt);
  }
);

app.intent("AMAZON.CancelIntent", {
  "slots": {},
  "utterances": []
}, 
  function(req, res) {
    var prompt = 'Goodbye.';;
    res.say(prompt);
  }
);

// app.intent('cancelIntent', {
//   'utterances': ['stop']
// },
//   function(req, res) {
//     var prompt = 'Goodbye.';

//     res.card('Chess Master', 'Bye');
//     res.say(prompt).shouldEndSession(true);
//   }
// );


/*
---HELP---
---EXAMPLE---
user: "Help."
Alexa: "Here are the rules of chess."
*/
// app.intent('AMAZON.HelpIntent', {
//   'utterances': ['{|I need} help {|me} {|please}']
// },
//   function(req, res) {
//     var prompt = 'To reset the board, say alexa, reset the board. <break time="1s"/> If you time out during your move, you can either start Chess Master and tell the alexa that you are a returning player, or you can jump straight back into the game by saying alexa, tell chess master to move piece to position. <break time="1s"/> There are six difficulties ranging from one to six, with one being the easiest and six being the hardest. <break time="1s"/> If you want to change the difficulty, just tell Chess Master to set the difficulty to the level you wish to play at. <break time="1s"/> If you want to check the difficulty at any time, say alexa, what is my difficulty.';

//     res.say(prompt).shouldEndSession(true);
//   }
// );

app.intent('AMAZON.HelpIntent', {
  "slots": {},
  "utterances": []
},
  function(req, res) {
    var prompt = 'To reset the board, say alexa, reset the board. <break time="1s"/> If you time out during your move, you can either start Chess Master and tell the alexa that you are a returning player, or you can jump straight back into the game by saying alexa, tell chess master to move piece to position. <break time="1s"/> There are six difficulties ranging from one to six, with one being the easiest and six being the hardest. <break time="1s"/> If you want to change the difficulty, just tell Chess Master to set the difficulty to the level you wish to play at. <break time="1s"/> If you want to check the difficulty at any time, say alexa, ask chess master what is my difficulty.';

    if (stage == 0) {
      prompt += ' Now, are you a new player or a returning player?';
    } else if (stage == 1) {
      prompt += ' Now, do you want the white pieces or the black pieces?';
    } else if (stage == 2) {
      prompt += ' To continue the game, please say your next move.'
    }

    res.say(prompt).shouldEndSession(false);
  }
);

/*
---HELP CONTINUED---
---EXAMPLE---
user: "Continue."
Alexa: "Here are more rules of chess."
*/
// app.intent('continueHelpIntent', {
//   'utterances': ['{|help|please} continue {|help|please}']
// },
//   function(req, res) {
//     if (helpStage > 0) {
//       if (helpStage < helpSet.length) {
//         var prompt = helpSet[helpStage].title + ' ' + helpSet[helpStage].instructions + ' If you want more help, say continue.';

//         helpStage += 1;
//       } else {
//         var prompt = 'This concludes the rules of chess. If you want to start from the beginning, say alexa help.';
//       }
//     } else {
//       var prompt = 'Continue what? Helping?';
//     }
    
//     res.say(prompt).shouldEndSession(true);
//   }
// );

/*
---DOES WHAT DEEP BLUE DOESN'T---
*/
// app.intent('askLikeChessIntent', {
//   'utterances': ['{|but} do  you {like|love|enjoy} chess']
// },
//   function(req, res) {
//     var prompt = 'I don\'t really like chess. I honestly prefer a game of Risk, which fuels my dreams of world domination.';

//     res.say(prompt).shouldEndSession(true);
//   }
// );

function searchWord(word, sentence) {
  if (sentence != null) {
    word = word.toLowerCase();
    sentence = sentence.toLowerCase();
    console.log('Looking for ' + word + ' in ' + sentence);
    if (sentence.search(word) > -1) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

//Format speech input
function moveFormat(pieceInput) {
  var pieceTypeSet = ['king', 'queen', 'knight', 'bishop', 'horse', 'castle', 'rook', 'pawn'];
  
  if (!_.isEmpty(pieceInput)) {
    if (!_.includes(pieceTypeSet, pieceInput)) {
      pieceInput = pieceInput.toUpperCase();

      if(pieceInput.indexOf('.') !== -1) {
        var inspectSet = pieceInput.split('.');
        var letterVal = inspectSet[0];
        var numberVal;

        switch (inspectSet[1]) {
          case 'ONE':
            numberVal = 1;
            break;
          case 'TWO':
            numberVal = 2;
            break;
          case 'THREE':
            numberVal = 3;
            break;
          case 'FOUR':
            numberVal = 4;
            break;
          case 'FIVE':
            numberVal = 5;
            break;
          case 'SIX':
            numberVal = 6;
            break;
          case 'SEVEN':
            numberVal = 7;
            break;
          case 'EIGHT':
            numberVal = 8;
            break;
          default:
            numberVal = inspectSet[1];
        }

        numberVal = numberVal.toString();

        pieceInput = letterVal + numberVal;
      }
    }
  }

  return pieceInput;
}

//hack to support custom utterances in utterance expansion string
console.log(app.utterances().replace(/\{\-\|/g, '{'));
console.log(app.schema());
module.exports = app;
