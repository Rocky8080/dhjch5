/**
 * Created by Rocky on 16/7/20.
 */
var express = require('express');
var http = require('https');
var router = express.Router();

var APPID = 'wxa288ea63f4c9c3be';
var APPSECRET = '6dc41cf6db56d3513f3661dd7ec35240';
var token;
var appId = APPID;
var nonceStr;
var timestamp;
var signature;

// http.get("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + appId + "&secret=" + APPSECRET, function(response) {
//     // Continuously update stream with data
//     var body = '';
//     response.on('data', function(d) {
//         body += d;
//     });
//     response.on('end', function() {
//
//         // Data reception is done, do whatever with it!
//         var parsed = JSON.parse(body);
//         token = parsed.access_token
//         console.log(token);
//     });
// }).on('error', function(e) {
//     console.log("Got error: " + e.message);
// });

/* GET home page. */
router.get('/map.html', function(req, res) {
    // console.log(req.baseUrl);
    res.render('map.html', { appId:appId});
});

module.exports = router;
