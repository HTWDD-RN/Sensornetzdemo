const express = require('express');
const app = express();

const ipAddress = process.env.IP_ADDRESS || 'vs0.inf.ethz.ch';

const coapService = require('./services/coapService');
// coapService.get(ipAddress, '/.well-known/core', console.log, console.error);
coapService.post(ipAddress, '/LED/green', "", undefined, console.log, console.log);
// coapService.post('vs0.inf.ethz.ch', '/large-post', '5897', undefined, console.log, console.error);

module.exports = app;