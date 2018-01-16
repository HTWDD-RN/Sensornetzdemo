'use strict';

const coap = require('./coapService');

/**
 *
 * @param {string} ip
 * @param {string} actionPath
 * @param {string} payload
 * @param {function} success
 * @param {function} fail
 */
var sendRequest = function (ip, actionPath, payload, success, fail) {
    console.log("Sedning request to", ip, "to", actionPath, "; payload=", payload);
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

exports.setState = function (ip, nodeIp, actionPath, payload, success, fail) {
    sendRequest(ip, actionPath, nodeIp + "#" + payload+ "\n", success, fail);
};

/**
 *
 * @param {string} ip
 * @param {string} actionPath
 * @param {array} data - array of objects containing node ip and payload, e.g. [{ip: '::2', payload: '1'}]
 * @param {function} success
 * @param {function} fail
 */
exports.multicast = function (ip, actionPath, data, success, fail) {
    var processedData = "";
    for (let nodeData of data) {
        processedData += nodeData.ip + "#" + nodeData.payload + "\n";
    }
    sendRequest(ip, actionPath, processedData, success, fail);
};

/**
 *
 * @param {String} ip - ip address of the requested node
 * @returns {Array} - raw array containing node resource information
 */
exports.discover = function (ip, success, fail) {
    coap.get(ip, "/.well-known/core", success, fail);
};
