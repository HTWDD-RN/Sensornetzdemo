'use strict';

const coap = require('./coapService');

exports.setState = function (ip, actionPath, payload, success, fail) {
    const successWrapper = (dataType, data) => {
        if (success && typeof success == 'function') {
            success(data);
        }
    }
    const isDebugMode = process.argv.indexOf("--d") !== -1;
    if (!isDebugMode) {
        coap.post(ip, actionPath, payload, undefined, successWrapper, fail);
    } else {
        successWrapper("text/plain", payload);
    }
    return 0;
};

/**
 * 
 * @param {String} ip - ip address of the requested node 
 * @returns {Array} - raw array containing node resource information
 */
exports.discover = function (ip, success, fail) {
    coap.get(ip, "/.well-known/core", success, fail);
};