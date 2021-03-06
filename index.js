
/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger Platform Quick Start Tutorial
 *
 * This is the completed code for the Messenger Platform quick start tutorial
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 * To run this code, you must do the following:
 *
 * 1. Deploy this code to a server running Node.js
 * 2. Run `npm install`
 * 3. Update the VERIFY_TOKEN
 * 4. Add your PAGE_ACCESS_TOKEN to your environment vars
 *
 */

'use strict';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
// Imports dependencies and set up http server
const
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),

  app = express().use(body_parser.json()); // creates express http server

// A list of users
// Store the type of all users

// All users are identified using an ID of type STRING

let users = new Map();

/* sessions to hold information on current conversations*/
let sessions = new Map();

const fields = ["education", "business", "it"];
/*
  name -> John Sm ith
  id -> 123456
  country -> United Kingdom
  ------------------------
  name -> Jane Doe
  id -> 98765
  country -> Iceland

  {
    "name": "John Smith",
    "id": "123456",
    "country": "United Kingdom"
  }

  "123456": {
    "name": "John Smith",
    "country": "United Kingdom"
  }
*/

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    body.entry.forEach(function(entry) {

      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);


      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender ID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {

        handlePostback(sender_psid, webhook_event.postback);
      }

    });
    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {

  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Check if a token and mode were sent
  if (mode && token) {

    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

function isUserMatch(user, target){
  if(target.active && !sessions.has(target.id)){
    return user.type != target.type && user.field == target.field
  }
}

function matchUser(sender_psid){
  let possibleMatches = []
  console.log(`Checking possible matches for ${sender_psid}`)
  users.forEach((value, key) => {
    console.log(`Checking ${key}: Active ${value.active}, Type ${value.type}`)
    let user = {...(users.get(sender_psid)), id: sender_psid}
    let target = {...(users.get(key)), id: key}
    if (isUserMatch(user, target)) {
      console.log(`Target PSID: ${key}`)
      possibleMatches.push(key)
    }
  })
  if (possibleMatches.length > 0){
    console.log(`Possible matches ${possibleMatches}`)
    let match = Math.floor(Math.random() * possibleMatches.length)
    sessions.set(sender_psid, possibleMatches[match]);
    sessions.set(possibleMatches[match], sender_psid);
    let match_alert = {
      "text": "You have been matched. Say hi. Feel free to type \"disconnect\" at any time to end the conversation"
    }
    callSendAPI(sender_psid, match_alert)
    callSendAPI(possibleMatches[match], match_alert)
    console.log(`${sender_psid} matched with ${users.get(possibleMatches[match])}`)
    return true
  } else {
    console.log("No matches found")
    return false
  }
}

// Ends the session for users that have been disconnected
function endSession(sender_psid, matched_psid){
  sessions.delete(sender_psid)
  sessions.delete(matched_psid)
  users.get(sender_psid).active = false
  users.get(matched_psid).active = false
}

async function handleMessage(sender_psid, received_message) {
  let response;
  let thankYouMessage;

  let awaitResponse = false

  // Checks if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    if(!(users.has(sender_psid))){
      switch(received_message.text.toLowerCase()){
        case "get started":
          awaitResponse = true
          let greeting = {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "generic",
                "elements": [
                  {
                    "image_url": "https://i.imgur.com/M0NokZH.jpg",
                    "title": "Welcome to Mentoree! My name is Socrates.",
                    "subtitle": "I will be assisting you with your mentorship matchmaking"
                  }
                ]
              }
            }
            // "text": "Welcome to Mentoree! My name is Socrates and I\'ll be assisting you with your mentorship matchmaking",
          }
          callSendAPI(sender_psid, greeting)
          response = {
            "text": "Are you a *Mentor*, or are you a *Mentee* looking for a mentor?",
            "quick_replies": [
              {
                "content_type": "text",
                "title": "Mentee",
                "payload": "Mentee",
              },
              {
                "content_type": "text",
                "title": "Mentor",
                "payload": "Mentor",
              }
            ]
          }
          break
        case "mentor":
          awaitResponse = true
          thankYouMessage = {
            "text": "Hello mentor,  We’re delighted to have another mentor here!"
          };
          callSendAPI(sender_psid, thankYouMessage);
          response = {
            "text": "What field are you in?",
            "quick_replies": [
              {
                "content_type": "text",
                "title": "Education",
                "payload": "education",
              },
              {
                "content_type": "text",
                "title": "Business",
                "payload": "business",
              },
              {
                "content_type": "text",
                "title": "IT",
                "payload": "it",
              }
            ]
          }
          users.set(sender_psid, {
            "type": "mentor"
          })
          break;
        case "mentee":
          awaitResponse = true
          thankYouMessage = {
            "text": "Hello mentee, I\'m happy to assist you with finding a mentor!"
          };
          await callSendAPI(sender_psid, thankYouMessage);
          response = {
            "text": "What field are you in?",
            "quick_replies": [
              {
                "content_type": "text",
                "title": "Education",
                "payload": "education",
              },
              {
                "content_type": "text",
                "title": "Business",
                "payload": "business",
              },
              {
                "content_type": "text",
                "title": "IT",
                "payload": "it",
              }
            ]
          }
          users.set(sender_psid, {
            "type": "mentee"
          })
          break;
        default:
          response = {

          }
          response = {
            "text": "I don't understand, can you please select 'Mentee' or 'Mentor'?",
            "quick_replies": [
              {
                "content_type": "text",
                "title": "Mentee",
                "payload": "Mentee",
              },
              {
                "content_type": "text",
                "title": "Mentor",
                "payload": "Mentor",
              }
            ]
          }
          break
      }
    } else {
      if(sessions.has(sender_psid)){
        let matched_psid = sessions.get(sender_psid);
        let message
        if(received_message.text.toLowerCase() == "disconnect"){
          message = {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "generic",
                "elements": [
                  {
                    "title": "Your conversation has ended",
                    "subtitle": "Please feel free to press the 'Match me' button to search for another conversation",
                    "buttons": [
                      {
                        "type": "postback",
                        "title": "Match me",
                        "payload": "match me"
                      }
                    ]
                  }
                ]
              }
            },
          }
          endSession(sender_psid, matched_psid)
          callSendAPI(sender_psid, message)
          callSendAPI(matched_psid, message)
        }else{
          message = {
            "text": received_message.text
          }
          callSendAPI(matched_psid, message);
        }

      } else {
        if(!("field" in users.get(sender_psid))){
          if(fields.includes(received_message.text.toLowerCase())){
            users.get(sender_psid).field = received_message.text.toLowerCase();
            response = {
              "attachment": {
                "type": "template",
                "payload": {
                  "template_type": "generic",
                  "elements": [
                    {
                      "title": "Thank you for providing your field",
                      "subtitle": "Press the 'Match me' button if you would like to be matched with someone now",
                      "buttons": [
                        {
                          "type": "postback",
                          "title": "Match me",
                          "payload": "match me"
                        }
                      ]
                    }
                  ]
                }
              },
            }
          }else{
            response = {
              "text": "Please choose from the options provided.",
              "quick_replies": [
                {
                  "content_type": "text",
                  "title": "Education",
                  "payload": "education",
                },
                {
                  "content_type": "text",
                  "title": "Business",
                  "payload": "business",
                },
                {
                  "content_type": "text",
                  "title": "IT",
                  "payload": "it",
                }
              ]
            }
          }
        }else{
          switch (received_message.text.toLowerCase()) {
            case "get started":
              users.delete(sender_psid)
              response = {
                "text": "Welcome to Mentoree! My name is Socrates and I\'ll be assisting you with your mentorship matchmaking",
                "quick_replies": [
                  {
                    "content_type": "text",
                    "title": "Mentee",
                    "payload": "Mentee",
                  },
                  {
                    "content_type": "text",
                    "title": "Mentor",
                    "payload": "Mentor",
                  }
                ]
              }
              break
            case "match me":
              if (users.has(sender_psid)){
                if(users.get(sender_psid).type == "mentor"){
                  matchType = "mentee"
                } else {
                  matchType = "mentor"
                }
                response = {
                  "text": `We will now attempt to match you in a live conversation with a ${matchType} in your field`
                }
                users.get(sender_psid).active = true
                let matched = matchUser(sender_psid)
                if (matched) {
                  let match = sessions.get(sender_psid)
                  setTimeout(() => {
                    if(sessions.get(sender_psid) == match) {
                      let message = {
                        "attachment": {
                          "type": "template",
                          "payload": {
                            "template_type": "generic",
                            "elements": [
                              {
                                "title": "Your conversation has exceeded 15 minutes",
                                "subtitle": "Please feel free to press the 'Match me' button to search for another conversation",
                                "buttons": [
                                  {
                                    "type": "postback",
                                    "title": "Match me",
                                    "payload": "match me"
                                  }
                                ]
                              }
                            ]
                          }
                        },
                      }
                      callSendAPI(sender_psid, message)
                      callSendAPI(matched_psid, message)
                      endSession(sender_psid, match)
                    }
                  }, 900000)
                }
              } else {
                response = {
                  "text": "Hello user. Please type 'mentee' or 'mentor' to tell us who you are"
                }
              }
              break
            case "what am i":
              if(users.has(sender_psid)) {
                response = {
                  "text": `You are currently registered as ${users[sender_psid].type}`
                }
              } else {
                response = {
                  "text": "Hello user. Please type 'mentee' or 'mentor' to tell us who you are"
                }
              }
              break
            default:
              response = {
                "attachment": {
                  "type": "template",
                  "payload": {
                    "template_type": "generic",
                    "elements": [
                      {
                        "title": "I don't understand. Please type or press 'Match me' to get matched with someone",
                        "buttons": [
                          {
                            "type": "postback",
                            "title": "Match me",
                            "payload": "match me"
                          }
                        ]
                      }
                    ]
                  }
                },
              }
              break
          }
        }
      }
    }
  }

  // Send the response message
  if(awaitResponse){
    await setTimeout(() => {callSendAPI(sender_psid, response)}, 3000);
  } else {
    callSendAPI(sender_psid, response)
  }

}

async function handlePostback(sender_psid, received_postback) {
  let awaitResponse = false
  console.log('ok')
   let response;
  // Get the payload for the postback
  let payload = received_postback.payload;

  switch (payload.toLowerCase()) {
    case "get started":
      if(users.has(sender_psid)){
        users.delete(sender_psid)
      }
      let greeting = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": [
              {
                "image_url": "https://i.imgur.com/M0NokZH.jpg",
                "title": "Welcome to Mentoree! My name is Socrates.",
                "subtitle": "I will be assisting you with your mentorship matchmaking"
              }
            ]
          }
        }
        // "text": "Welcome to Mentoree! I am Socrates, and I'm here to assist you with your mentorship matchmaking"
      }
      callSendAPI(sender_psid, greeting)
      awaitResponse = true
      response = {
        "text": "Are you a *Mentor*, or are you a *Mentee* looking for a mentor?",
        "quick_replies": [
          {
            "content_type": "text",
            "title": "Mentee",
            "payload": "Mentee",
          },
          {
            "content_type": "text",
            "title": "Mentor",
            "payload": "Mentee",
          }
        ]
      }
    break
    case "match me":
      if (sessions.has(sender_psid)){
        response = {
          "text": "Hello user. Please type 'disconnect' to exit your current conversation before you can search for a new match"
        }
      } else {
        let matchType
        if(users.get(sender_psid).type == "mentor"){
          matchType = "mentee"
        } else {
          matchType = "mentor"
        }
        response = {
          "text": `We will now attempt to match you in a live conversation with a ${matchType} in your field`
        }
        users.get(sender_psid).active = true
        let matched = matchUser(sender_psid)
        if(matched) {
          let match = sessions.get(sender_psid)
          setTimeout(() => {
            if(sessions.get(sender_psid) == match) {
              let message = {
                "attachment": {
                  "type": "template",
                  "payload": {
                    "template_type": "generic",
                    "elements": [
                      {
                        "title": "Your conversation has exceeded 15 minutes",
                        "subtitle": "Please feel free to press the 'Match me' button to search for another conversation",
                        "buttons": [
                          {
                            "type": "postback",
                            "title": "Match me",
                            "payload": "match me"
                          }
                        ]
                      }
                    ]
                  }
                },
              }
              callSendAPI(sender_psid, message)
              callSendAPI(match, message)
              endSession(sender_psid, match)
            }
          }, 900000)
        } else {
          setTimeout(() => {
            if(!sessions.has(sender_psid) && users.get(sender_psid).active){
              let timeout_message = {
                "attachment": {
                  "type": "template",
                  "payload": {
                    "template_type": "generic",
                    "elements": [
                      {
                        "title": "I'm sorry but we could not find a match for you",
                        "subtitle": "Feel free to press the 'Match me' button to search again",
                        "buttons": [
                          {
                            "type": "postback",
                            "title": "Match me",
                            "payload": "match me"
                          }
                        ]
                      }
                    ]
                  }
                },
              }
              users.get(sender_psid).active = false;
              callSendAPI(sender_psid, timeout_message);
            }
          }, 600000)
        }
      }
      break
  }
  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  }
  // Send the message to acknowledge the postback
  if(awaitResponse){
    await setTimeout(() => {callSendAPI(sender_psid, response)}, 3000);
  } else {
    callSendAPI(sender_psid, response)
  }
}

async function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  return request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });

}
