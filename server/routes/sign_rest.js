/**
 * Created by Rocky on 16/8/12.
 */
var express = require('express');
// var bodyParser = require('body-parser')

var http = require('https');
var router = express.Router();
var redis = require('redis');
var sign = require('../sign');

var client = redis.createClient(); //creates a new client

var APPID = 'wxa288ea63f4c9c3be';
var APPSECRET = '6dc41cf6db56d3513f3661dd7ec35240';
var token;
var ticket;
var appId = APPID;
var nonceStr;
var timestamp;
var signature;


function refresh_token(){
    client.on('connect', function() {
    });

    client.get('token', function(err, reply) {
        token = reply;
        console.log('get token : ' + token);

        if (!token){
            http.get("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + appId + "&secret=" + APPSECRET, function(response) {
                // Continuously update stream with data
                var body = '';
                response.on('data', function(d) {
                    body += d;
                });
                response.on('end', function() {

                    // Data reception is done, do whatever with it!
                    var parsed = JSON.parse(body);
                    token = parsed.access_token
                    client.set('token', token, redis.print);
                    client.expire('token', 7200);
                    console.log('set token : ' + token);
                });
            }).on('error', function(e) {
                console.log("Got error: " + e.message);
            });
        }

        // 初始化ticket
        client.get('ticket', function(err, reply) {
            ticket = reply;
            console.log('get ticket : ' + ticket);

            if (ticket == 'undefined' || ticket == undefined || ticket == null){
                http.get("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + token +"&type=jsapi", function(response) {
                    // Continuously update stream with data
                    var body = '';
                    response.on('data', function(d) {
                        body += d;
                    });
                    response.on('end', function() {
                        console.log('ticket body : ' + body);
                        // Data reception is done, do whatever with it!
                        var parsed = JSON.parse(body);
                        ticket = parsed.ticket
                        if (ticket != 'undefined' && ticket != undefined && ticket != null) {
                            client.set('ticket', ticket, redis.print);
                            client.expire('ticket', 7200);
                        }
                        console.log('set ticket' + ticket);
                    });
                }).on('error', function(e) {
                    console.log("Got error: " + e.message);
                });
            }
        });
    });
}


// // create application/json parser
// var jsonParser = bodyParser.json()
//
// // create application/x-www-form-urlencoded parser
// var urlencodedParser = bodyParser.urlencoded({ extended: false })

// POST /login gets urlencoded bodies
router.post('/sign', function (req, res) {
    if (!req.body) return res.sendStatus(400)
    res.send('welcome, ' + req.body.username)
})

router.post('/sign', function (req, res) {
    res.send('welcome, rocky!');
})