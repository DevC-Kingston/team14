
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
  const VERIFY_TOKEN = "abc123";

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

function matchUser(sender_psid){
  let type = users.get(sender_psid).type
  let matchType
  if (type == "mentor"){
    matchType = "mentee"
  } else {
    matchType = "mentor"
  }
  // let possibleMatches = users.filter(([id, data])=>{
  //   if (data.active == true && data.type == matchType){
  //     return true
  //   } else {
  //     return false
  //   }
  // })
  let possibleMatches = []
  console.log(`Checking possible matches for ${sender_psid}`)
  users.forEach((value, key) => {
    console.log(`Checking ${key}: Active ${value.active}, Type ${value.type}`)
    if (value.active == true && value.type == matchType) {
      console.log(`${key}`)
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

function handleMessage(sender_psid, received_message) {
  let response;
  let thankYouMessage;

  // Checks if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    if(!(users.has(sender_psid))){
      switch(received_message.text.toLowerCase()){
        case "get started":
          response = {
            "text": "Welcome to Socrates. Please tell us if you are a Mentee looking for mentorship, or a Mentor who would like to assist someone",
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
        case "mentor":
          thankYouMessage = {
            "text": "Welcome to Socrates! Hello mentor; thank you for signing up"
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
          thankYouMessage = {
            "text": "Welcome to Socrates! Hi mentee! We\'re happy to help with choosing your mentor"
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
            "type": "mentee"
          })
          break;
        default:
          response = {
            "text": "I don't understand, can you please type the word mentee or mentor?"
          }
          break
      }
    } else {
      if(sessions.has(sender_psid)){
        let matched_psid = sessions.get(sender_psid);
        let message
        if(received_message.text.toLowerCase() == "disconnect"){
          message = {
            "text": "user has ended session please type match me to start another session"
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
        if(!("field" in users.get(sender_psid))){
          if(fields.includes(received_message.text.toLowerCase())){
            users.get(sender_psid).field = received_message.text.toLowerCase();
            response = {
              "text": "Type \"match me\" if you would like to be matched with someone now."
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

        }
      } else {        
        switch (received_message.text.toLowerCase()) {
          case "match me":
            if (users.has(sender_psid)){
              response = {
                "text": "We will now attempt to match you"
              }
              users.get(sender_psid).active = true
              matchUser(sender_psid)
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
              "text": "We don't understand. Please type 'match me' to get matched with someone"
            }
            break
        }
      }
    }
    
  }

  setTimeout(callSendAPI(sender_psid, response), 3000);
  
  // Send the response message
 // callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {
  console.log('ok')
   let response;
  // Get the payload for the postback
  let payload = received_postback.payload;

  switch (payload.toLowerCase()) {
    case "get started":
      response = {
        "text": "Welcome to Socrates. Please tell us if you are a Mentee looking for mentorship, or a Mentor who would like to assist someone",
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
    
  }
  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
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
