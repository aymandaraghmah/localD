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
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "mydb"
});


app.listen(3000);
var bot_access_token;
var access_token;

// app.get('/oauth', function (req, res) {
//     // con.end();

//     var co = req.query.code;
//     var sta = req.query.state;
//     console.log("code is :  " + co);
//     var propertiesObject = {
//         client_id: '117750339904.205675326374', client_secret: 'a7bd2945b2782472ea881d5caf47248a',
//         code: co, redirect_uri: 'https://b60e61b3.ngrok.io/oauth'
//     };

//     request({ url: 'https://slack.com/api/oauth.access', qs: propertiesObject }, function (err, response, body) {

//         if (err) { console.log(err); return; }
//         console.log("access token: " + body);
//         bot_access_token = (JSON.parse(body)).bot.bot_access_token;
//         access_token = (JSON.parse(body)).access_token;
//         console.log("access token: " + (JSON.parse(body)).bot.bot_access_token);
//         bot = startConnection((JSON.parse(body)).bot.bot_access_token)
//         con.connect(function (err) {
//             if (err) {

//                 console.log("Already connected!");

//             }
//             console.log("Connected!");
//         });

//         var sql = "REPLACE INTO Configurations (Name, Value) VALUES ? ";
//         var values = [
//             ['access_token', access_token],
//             ['bot_access_token', bot_access_token]

//         ];
//         con.query(sql, [values], function (err, result) {
//             if (err) throw err;
//             console.log("Number of records inserted: " + result.affectedRows);
//         });

        

//     });
//     console.log("code is :  " + co);
//     console.log("state is :  " + sta);
// });



var controller = Botkit.slackbot({
    interactive_replies: true, require_delivery: true,
}).configureSlackApp(
    {
        clientId: "117750339904.205675326374",
        clientSecret: "a7bd2945b2782472ea881d5caf47248a",
        scopes: ['bot'],
    }
    );;


//var bot = startConnection("xoxb-204194928624-N52Qgzh2TAmTcbybKi5tCybK")
controller.hears('hi', 'direct_message', function (bot, message) {

    bot.reply(message, {
        attachments: [
            {
                title: 'Okay, you asked for a time off on Mon, Jul 03 at 08:00 am to Mon, Jul 03 at 05:00 pm and that would be 1.00 working day.[Note]: There is an already taken time off  from Sun, Jul 02 at 08:00 am to Thu, Jul 13 at 05:00 pm and it will be overwritten when you press "Yes". Should I go ahead ?',
                callback_id: 'normal_vacation',
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
                    },
                    {
                        "name": "addcomment",
                        "text": "Add comment",
                        "value": "addcomment",
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
    var message;
    res.status(200).end() // best practice to respond with 200 status
    var actionJSONPayload = JSON.parse(req.body.payload) // parse URL-encoded payload JSON string
    if (actionJSONPayload.callback_id == "normal_vacation") {
        if (actionJSONPayload.actions[0].name == "yes") {
            message = {
                attachments: [
                    {
                        title: "Your request ( Mon, Jul 03 at 08:00 am to Mon, Jul 03 at 05:00 pm ) has been submitted and is awaiting your managers approval.",
                        callback_id: 'normal_vacation',
                        attachment_type: 'default',
                        actions: [
                            {
                                "name": "cancel",
                                "text": "Cancel",
                                "value": "cancel",
                                "type": "button",
                            }
                        ]
                    }
                ],
                "replace_original": true
            }
        }
    }

    console.log("Replied message is :" + JSON.stringify(message));
    console.log("PAYLOAD is :" + JSON.stringify(actionJSONPayload));

    sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
})

controller.setupWebserver('3000', function(err, webserver) {
    controller.createWebhookEndpoints(controller.webserver);

    controller.createOauthEndpoints(controller.webserver, function(err, req, res) {
        if (err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            res.send('Success!');
        }
    });

    // If not also opening an RTM connection
    controller.startTicking();
});



function startConnection(token) {
    var bot = controller.spawn({
        token: token
    });
    return bot;
}