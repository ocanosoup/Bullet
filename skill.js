// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
var targetDevice = ""; //Here is where the required fields need to be filled in
var sourceUser = "";
var accessToken = '';
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
             context.fail("Invalid Application ID");
        }
        */

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if ("sendtoPushBulletIntent" === intentName) {
        sendToPushBullet(intent, session, callback);
    } else if ("AMAZON.YesIntent" === intentName) {
        sendToPushBullet(intent,session,callback)
    } else if ("AMAZON.HelpIntent" === intentName) {
        getWelcomeResponse(callback)
    } else if ("AMAZON.StopIntent" === intentName || "AMAZON.CancelIntent" === intentName || "AMAZON.NoIntent" === intentName) {
        handleSessionEndRequest(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function handleSessionEndRequest(callback) {
    var cardTitle = null;
    var speechOutput = null;
    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "I can send texts for you, just say something like, send a text to John";
    var repromptText = ""
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function sendToPushBullet(intent, session, callback) {
    var cardTitle = querySlot;
    var cardText = "Yo";
    var speechOutput = "";
    var repromptText = "";
    var shouldEndSession = false;
    if (session.attributes) {
        var querySlot = session.attributes.query;
        numberSlot = session.attributes.numberSlot;
    }
    if(!querySlot) {
        var querySlot = intent.slots.query.value;
    }
    if(!numberSlot) {
        var numberSlot = intent.slots.number.value;
    }
    console.log(querySlot);
    console.log(numberSlot);
    if ((numberSlot === undefined) && (querySlot === undefined)) {
        speechOutput = "Please Specify Who you would like to send this to and what you would like to say.";
        callback(sessionAttributes,
            buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
    if ((numberSlot === undefined) && (querySlot !== undefined)) {
        console.log("#1");
        speechOutput = "Sorry, couldn't quite catch who you wanted to send that to. Please try again";
        sessionAttributes = createQueryAttribute(querySlot);
        callback(sessionAttributes,
            buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
    if ((numberSlot !== undefined) && (querySlot === undefined)) {
        speechOutput = "Can you try that again? I didn't get what you wanted to say";
        sessionAttributes = createNumberAttribute(numberSlot);
        callback(sessionAttributes,
            buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
    if ((numberSlot !== undefined) && (querySlot !== undefined)) {
        console.log("BOTH");
        querySlot = capitalizeFirstLetter(querySlot);
        if (isNaN(numberSlot) && numberSlot !== undefined) {
            switch(numberSlot.toUpperCase()) {
                // Here is where you would put your cases for contact names
                case "NAME":
                    numberSlot = "number";
                    break;
                default:
                    speechOutput = "Please Specify a vaild contact name."
                    callback(sessionAttributes,
                    buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
                    break;
            }
        } else {
        }
        if ("AMAZON.YesIntent" !== intent.name) {
            sessionAttributes = createBothAttribute(numberSlot, querySlot)
            speechOutput = "I am about to send " + querySlot + " to <say-as interpret-as=\"digits\">" + numberSlot + "</say-as>, is that right?"

            callback(sessionAttributes,
            buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
        } else {

            sendText(numberSlot, querySlot, callback)
        }
    }
}

function sendText(numberSlot, querySlot, callback) {
    var cardTitle = querySlot + " to " + numberSlot
    var cardText = ""
    var speechOutput = "";
    var repromptText = "";
    var shouldEndSession = true;
    var https = require('https');
    var text = {"type":"push","targets":["stream","android","ios"],"push":{"package_name":"com.pushbullet.android","target_device_iden":targetDevice,"source_user_iden":sourceUser,"message": querySlot + "\nCourtesy of Alexa","type":"messaging_extension_reply","conversation_iden":"+1"+numberSlot}}
        text = JSON.stringify(text)
        console.log(text)

        var headers = {
            'Access-Token': accessToken,
            'Content-Type': 'application/json',
        };


  // An object of options to indicate where to post to
  var post_options = {
      host: 'api.pushbullet.com',
      path: '/v2/ephemerals',
      method: 'POST',
      headers: headers
  };

  // Set up the request
  var post_req = https.request(post_options, function(res) {
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
          if (chunk = {}) {
              speechOutput = "Text Sent to <say-as interpret-as=\"digits\">" + numberSlot + "</say-as>!"//This will read them out individually instead of as a huge number in the millions
              cardText = "Text Sent!"
          } else {
              speechOutput = "Text was not sent to <say-as interpret-as=\"digits\">" + numberSlot + "</say-as>."
              cardText = "Text was sent unsuccessfully."
          }

          callback({},buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
      });
  });

  // post the data
  post_req.write(text);
  post_req.end();

}
function createQueryAttribute(querySlot) {
    return {
        query: querySlot
    };
}
function createNumberAttribute(numberSlot) {
    return {
         numberSlot: numberSlot
    };
}
function createBothAttribute(numberSlot, querySlot) {
    return {
         numberSlot: numberSlot,
         query: querySlot
    };
}
// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession, cardContent) {
    if (title === null && output === null) {
        return {
            shouldEndSession: shouldEndSession
        };
    } else {

        return {
            outputSpeech: {
                type: "SSML",
                ssml: "<speak>" + output + "</speak>"
            },
            card: {
                type: "Simple",
                title: title,
                content: cardContent
            },
            reprompt: {
                outputSpeech: {
                    type: "PlainText",
                    text: repromptText
                }
            },
            shouldEndSession: shouldEndSession
        };
    }

}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        response: speechletResponse,
        sessionAttributes: sessionAttributes
    };
}
