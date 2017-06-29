var Botkit = require('./lib/Botkit.js');
var os = require('os');
var express = require('express');
var request = require('request');
var url = require('url')
var app = express();
var bodyParser = require('body-parser')
var app = express()
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var bot;
app.get('/ayman', function (req, res) {
    var co = req.query.code;
    var sta = req.query.state;
    console.log("code is :  " + co);
    var propertiesObject = {
        client_id: '117750339904.205675326374', client_secret: 'a7bd2945b2782472ea881d5caf47248a',
        code: co, redirect_uri: 'https://28127b4b.ngrok.io/ayman'
    };

    request({ url: 'https://slack.com/api/oauth.access', qs: propertiesObject }, function (err, response, body) {
        if (err) { console.log(err); return; }
        console.log("access token: " + body);

        console.log("access token: " + (JSON.parse(body)).bot.bot_access_token);
         bot = startConnection((JSON.parse(body)).bot.bot_access_token);

    });
    console.log("code is :  " + co);
    console.log("state is :  " + sta);

});

app.listen(3000);


var controller = Botkit.slackbot({
    interactive_replies: true, require_delivery: true,
}).configureSlackApp(
    {
        clientId: "117750339904.205675326374",
        clientSecret: "a7bd2945b2782472ea881d5caf47248a",
        scopes: ['bot'],
    }
    );;

controller.hears('hi', 'direct_message', function (bot, message) {

    bot.reply(message, {
        attachments: [
            {
                title: 'Do you want to interact with my buttons?',
                callback_id: '123',
                attachment_type: 'default',
                actions: [
                    {
                        "name": "yes",
                        "text": "Yes",
                        "value": "yes",
                        "type": "button",
                    },
                    {
                        "name": "no",
                        "text": "No",
                        "value": "no",
                        "type": "button",
                    }
                ]
            }
        ]
    });
});

function sendMessageToSlackResponseURL(responseURL, JSONmessage) {
    var postOptions = {
        uri: responseURL,
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        json: JSONmessage
    }

    request(postOptions, (error, response, body) => {
        if (error) {
            // handle errors as you see fit
        }
    })
}

app.post('/slack/actions', urlencodedParser, (req, res) => {
    res.status(200).end() // best practice to respond with 200 status
    var actionJSONPayload = JSON.parse(req.body.payload) // parse URL-encoded payload JSON string
    var message = {
        "text": actionJSONPayload.user.name + " clicked: " + actionJSONPayload.actions[0].name,
        "replace_original": false
    }
    console.log("Replied message is :" + JSON.stringify(message));
    sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
})

function startConnection(token) {
    console.log("token is : "+token);
    var bot = controller.spawn({
        token: token
    }).startRTM(function (err, bot, payload) {
        if (err) {
            throw new Error('Could not connect to Slack');
        } else { console.log(payload); }
    });
    return bot;
}