'use strict';

const coap = require('./coapService');

exports.setState = function (ip, actionPath, payload, callback) {
    const success = function (dataType, data) {
        if (callback && typeof callback == 'function') {
            callback(data);
        }
    }
    coap.post(ip, actionPath, payload, undefined, success, success);
};