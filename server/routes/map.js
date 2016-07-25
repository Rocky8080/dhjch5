/**
 * Created by Rocky on 16/7/20.
 */
var express = require('express');
var http = require('https');
var router = express.Router();
var redis = require('redis');
var sign = require('../sign');

var client = redis.createClient(); //creates a new client

var APPID = 'wxa288ea63f4c9c3be';
var APPSECRET = '6dc41cf6db56d3513f3661dd7ec35240';
var token;
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
                    console.log('set token' + token);

                });
            }).on('error', function(e) {
                console.log("Got error: " + e.message);
            });
        }
    });


}



/* GET home page. */
router.get('/map.html', function(req, res) {
    console.log('baseUrl : ' + req.url);
    refresh_token();
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    console.log('full_url:' + fullUrl);
    
    var sign_params = sign(token, fullUrl);
    console.log(sign_params);
    res.render('map.html', {
        appId:appId,
        nonceStr:sign_params.nonceStr,
        timestamp:sign_params.timestamp,
        signature:sign_params.signature});
});

module.exports = router;
