'use strict';
const coap = require('coap');
const stringifyBuffer = require('stringify-buffer');
const parseLinkFormat = require("../utils/linkFormatParser").parse;

/* Helpers */

const processPayload = function (payload, contentFormat) {
    const strPayload = stringifyBuffer(payload).binary;
    const type = contentFormat == "application/link-format" || contentFormat == "application/json" ? "json" : "plain";
    var data = strPayload;
    if (contentFormat == "application/link-format") {
        data = parseLinkFormat(data);
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

const getContentFormat = function (options) {
    for (var i = 0; i < options.length; i++) {
        if (options[i].name == "Content-Format") {
            return options[i].value;
        }
    }
}

/* API */

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
        hostname: host,
        pathname: pathname
    };
    coap.request(url).on('response', function (res) {
        const data = processPayload(res.payload, getContentFormat(res.options));
        if (success && typeof success == "function") {
            success(data.type, data.data);
        }
    }).on('error', (err) => {
        console.log(err, pathname);
        if (fail && typeof fail == "function") {
            fail(err);
            process.exit(-1);
        }
    }).on('timeout',(err)=>{
        console.log(err, pathname);
        if (fail && typeof fail == "function") {
            fail(err);
            process.exit(-1);
        }
    }).end();
};

/**
 *
 * Send post request
 *
 * @param {string} host
 * @param {string} pathname
 * @param {string} payload
 * @param {string} contentFormat
 * @param {function} success success callback, takes two parameters dataType (one of following: 'plain', 'json') and responsePayload
 * @param {function} fail
 */
exports.post = function (host, pathname, payload, contentFormat, success, fail) {
    const url = {
        hostname: host,
        pathname: pathname,
        method: "POST",
        headers: {
            'Content-Format': contentFormat || 'text/plain'
        }
    };
    const req = coap.request(url);
    req.on('response', function (res) {
        const data = processPayload(res.payload, getContentFormat(res.options));
        if (success && typeof success == "function") {
            success(data.type, data.data);
        }
    });
    req.on('error', (err) => {
        console.log(err, pathname);
        if (fail && typeof fail == "function") {
            fail(err);
            // process.exit(-1);
        }
    });
    req.on('timeout',(err)=>{
        console.log(err, pathname);
        if (fail && typeof fail == "function") {
            fail(err);
           // process.exit(-1);
        }
    })
    req.write(payload);
    req.end();
};
