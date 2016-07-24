var createNonceStr = function () {
  return Math.random().toString(36).substr(2, 15);
};

var createTimestamp = function () {
  return parseInt(new Date().getTime() / 1000) + '';
};

var raw = function (args) {
  var keys = Object.keys(args);
  keys = keys.sort()
  var newArgs = {};
  keys.forEach(function (key) {
    newArgs[key.toLowerCase()] = args[key];
  });

  var string = '';
  for (var k in newArgs) {
    string += '&' + k + '=' + newArgs[k];
  }
  string = string.substr(1);
  return string;
};

/**
* @synopsis 签名算法 
*
* @param jsapi_ticket 用于签名的 jsapi_ticket
* @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
*
* @returns
*/
var sign = function (jsapi_ticket, url) {
  var ret = {
    jsapi_ticket: jsapi_ticket,
    nonceStr: createNonceStr(),
    timestamp: createTimestamp(),
    url: url
  };
  var string = raw(ret);
  jsSHA = require('jssha');
  shaObj = new jsSHA(string, 'TEXT');
  ret.signature = shaObj.getHash('SHA-1', 'HEX');

  return ret;
};

console.log(sign('kgt8ON7yVITDhtdwci0qecrgvgj-k7Gb85DBM4cjKjjwkz15ju2jvcXNGLgFreneeR-heKwBCf-p2sPFV5YjAA'
    ,'http://dhjc.ecartoon.net/views/map.html?routes=116.537558,40.247976%7c116.34881,40.336134%7c116.368932,40.379348%7c116.339677,40.438605%7c116.367399,40.486663%7c116.418802,40.535472%7c116.300199,40.556658%7c116.128263,40.608%7c116.266063,40.39087%7c116.221013,40.243439&location=116.537558,40.247976'));

module.exports = sign;
