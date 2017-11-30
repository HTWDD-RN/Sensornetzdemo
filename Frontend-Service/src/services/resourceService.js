'use strict';

const coap = require('./coapService');

exports.setState = function (ip, actionPath, payload, callback) {
    const success = (dataType, data) => {
        if (callback && typeof callback == 'function') {
            callback(data);
        }
    }
    const fail = (err) => {
        if (callback && typeof callback == 'function') {
            // TODO: We might need to give a fallback or something
            callback(payload);
        }
    }

    coap.post(ip, actionPath, payload, undefined, success, fail);
};