'use strict';

const coap = require('./coapService');

exports.setState = function (ip, actionPath, payload, success, fail) {
    const successWrapper = (dataType, data) => {
        if (success && typeof success == 'function') {
            success(data);
        }
    }

    coap.post(ip, actionPath, payload, undefined, successWrapper, fail);
};