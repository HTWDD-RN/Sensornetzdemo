var express = require('express');
var app = express();

var coapService = require("./services/coapService");
coapService.get('vs0.inf.ethz.ch', '/.well-known/core', console.log, console.error);
coapService.post('vs0.inf.ethz.ch', '/large-post', '5897', console.log, console.error);

module.exports = app;