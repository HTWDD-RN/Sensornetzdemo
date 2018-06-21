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

/**
 * Set state of multiple nodes
 * 
 * @param {string} ip - the border router ip
 * @param {string} actionPath - the endpoint path
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
 * Get actions of a node.
 * 
 * @param {String} ip - ip address of the requested node
 * @returns {Array} - raw array containing node resource information
 */
exports.discover = function (ip, success, fail) {
    coap.get(ip, "/.well-known/core", success, fail);
};

/**
 * Set new state of a resource (action).
 * 
 * @param {String} ip  - the border router ip
 * @param {String} nodeIp - the target node ip
 * @param {String} actionPath - the action endpoint
 * @param {String} payload - the value to set
 * @param {Function} success - success callback
 * @param {Function} fail - fail callback
 */
exports.setState = function (ip, nodeIp, actionPath, payload, success, fail) {
    sendRequest(ip, actionPath, nodeIp + "#" + payload+ "\n", success, fail);
};