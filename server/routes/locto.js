/**
 * Created by Rocky on 16/7/20.
 */
var express = require('express');
var bodyParser = require('body-parser')


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

/* GET home page. */
router.get('/locto.html', function(req, res) {
    console.log('original url : ' + (req.originalUrl));
    console.log('encode url : ' + encodeURI(req.originalUrl));
    console.log('decode url : ' + decodeURI(req.originalUrl));
    var fullUrl = req.protocol + '://' + req.get('host') + (req.originalUrl);
    console.log('full_url:' + fullUrl);
    refresh_token();

    var sign_params = sign(ticket, fullUrl);
    console.log(sign_params);
    res.render('locto.html', {
        appId:appId,
        nonceStr:sign_params.nonceStr,
        timestamp:sign_params.timestamp,
        signature:sign_params.signature});
});

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: true })

router.get('/sign',urlencodedParser, function (req, res) {

    var fullUrl = req.query.fullurl;
    refresh_token();

    var sign_params = sign(ticket, fullUrl);
    console.log(sign_params);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
        appId:appId,
        nonceStr:sign_params.nonceStr,
        timestamp:sign_params.timestamp,
        signature:sign_params.signature}
        , null, 3));
})

module.exports = router;
