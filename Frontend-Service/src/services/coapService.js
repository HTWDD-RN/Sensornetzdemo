'use strict';
const coap = require('coap');
const stringifyBuffer = require('stringify-buffer');

const processPayload = function (payload, contentFormat) {
    const strPayload = stringifyBuffer(payload).binary;
    const type = contentFormat == "application/link-format" || contentFormat == "application/json" ? "json" : "plain";
    var data = strPayload;
    if (contentFormat == "application/link-format") {
        //TODO: parse payload
    } else if (contentFormat == "application/json") {
        try {
            data = JSON.parse(strPayload);
        } catch (e) {
            console.error(e);
        }
    }
    return {
        type: type,
        data: data
    };
}

/**
 * 
 * Send get request
 * 
 * @param {string} host
 * @param {string} pathname 
 * @param {function} success success callback, takes two parameters dataType (one of following: 'plain', 'json') and responsePayload
 * @param {function} fail 
 */
exports.get = function (host, pathname, success, fail) {
    const url = {
        host: host,
        pathname: pathname
    };
    coap.request(url).on('response', function (res) {
        const data = processPayload(res.payload, res.options['Content-Format']);// stringifyBuffer(res.payload).binary;
        if (success && typeof success == "function") {
            success(data.type, data.data);
        }
    }).end();
    //TODO: on fail
};

/**
 * 
 * Send post request
 * 
 * @param {string} host 
 * @param {string} pathname 
 * @param {string} payload
 * @param {function} success success callback, takes two parameters dataType (one of following: 'plain', 'json') and responsePayload
 * @param {function} fail 
 */
exports.post = function (host, pathname, payload, success, fail) {
    const url = {
        host: host,
        pathname: pathname,
        method: "POST"
    };
    const req = coap.request(url);
    req.on('response', function (res) {
        const data = processPayload(res.payload, res.options['Content-Format']);// stringifyBuffer(res.payload).binary;
        if (success && typeof success == "function") {
            success(data.type, data.data);
        }
    });
    req.write(payload);
    req.end();
    //TODO: on fail

};