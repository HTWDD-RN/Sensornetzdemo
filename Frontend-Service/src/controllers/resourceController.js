'use strict';

const resourceService = require('../services/resourceService');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const uuid = require('uuid/v4');

const RESOURCE_IPS = ["2001:db8::5855:1277:fb88:4f1e"];

const dummyResource = {
    id: "led_a",
    name: "Node A (LED)",
    state: "OPEN",
    ip: "2001:db8::5855:1277:fb88:4f1e",
    actions: [
        {
            id: "led_a_1",
            name: "Grüne LED",
            type: "SWITCH",
            actionPath: '/LED/green',
            parameter: {
                current: 0,
                on: 1,
                off: 0
            }
        },
        {
            id: "led_a_2",
            name: "Rote LED",
            type: "SWITCH",
            actionPath: '/LED/red',
            parameter: {
                current: 0,
                on: 1,
                off: 0
            },
        },
        {
            id: "led_a_3",
            name: "Dimmer",
            type: "RANGE",
            actionPath: '/DIMMER',
            parameter: {
                current: 127,
                min: 0,
                max: 255
            }
        },
        {
            id: "led_a_4",
            name: "RGB",
            type: "COLOR_RANGE",
            actionPath: '/RGB',
            parameter: {
                min: [0, 0, 0],
                max: [255, 255, 255],
                current: [127, 127, 127]
            }
        }
    ]
};

const r2 = {
    id: "led_b",
    name: "Node B (LED)",
    state: "OPEN",
    actions: [
        {
            id: "led_b_1",
            name: "an-/ausschalten",
            type: "SWITCH",
            parameter: {
                current: 0,
                on: 1,
                off: 0
            }
        }
    ]
};

const resources = [

];

const findResourceById = function (id) {
    for (var i = 0; i < resources.length; i++) {
        const resource = resources[i];
        if (resource.id == id) {
            return resource;
        }
    }
    return null;
};

const sendResourceNotFoundResponse = function (res, id) {
    res.status(400).send({ message: "Resource " + id + " not found" });
};

exports.get_resources = function (req, res) {
    const response = { response: resources };
    res.json(response);
};

exports.get_resource = function (req, res) {
    const id = req.params.resourceId;
    const resource = findResourceById(id);
    if (!resource) {
        sendResourceNotFoundResponse(res, id);
    } else {
        res.json({ response: resource });
    }
};

function isValidValue(action, value) {
    if (action.type == "SWITCH") {
        const val = parseInt(value);
        return val == action.parameter.on || val == action.parameter.off;
    } else if (action.type == "RANGE") {
        const val = parseInt(value);
        return val >= action.parameter.min && val <= action.parameter.max;
    } else if (action.type == "COLOR_RANGE") {
        const val = Array.isArray(value) ? value : JSON.parse(value);
        if (val.length !== 3) {
            return false;
        }
        for (var i = 0; i < 3; i++) {
            const intVal = parseInt(val[i]);
            if (intVal == undefined || intVal < action.parameter.min[i] || intVal > action.parameter.max[i]) {
                return false;
            }
        }
        return true;
    }

    console.log("Unknown action", action.type);
    return false;
}

function updateValue(action, value) {
    if (action.type == "SWITCH") {
        action.parameter.current = parseInt(value);
    } else if (action.type == "RANGE") {
        action.parameter.current = parseInt(value);
    } else if (action.type == "COLOR_RANGE") {
        const vals = value.split(";");
        const arr = [];
        for (let i of vals) {
            arr.push(parseInt(i));
        }
        action.parameter.current = arr;
    }
}

function getPayload(actionType, value) {
    if (actionType == "SWITCH" || actionType == "RANGE") {
        return value.toString();
    } else if (actionType == "COLOR_RANGE") {
        const arr = Array.isArray(value) ? value : JSON.parse(value);
        return arr.join(";");
    }
    return "";
}


exports.update_resource = function (req, res) {
    const resourceId = req.params.resourceId;
    const actionId = req.params.actionId;
    const value = req.body.value;
    if (value == undefined) {
        var message = "No value";
        res.status(400).send({ message: message });
        return;
    }

    const resource = findResourceById(resourceId);
    if (!resource) {
        sendResourceNotFoundResponse(res, resourceId);
    } else {
        for (let action of resource.actions) {
            if (action.id == actionId) {
                if (!isValidValue(action, value)) {
                    res.status(400).send({ message: 'Invalid value' });
                    return;
                }
                console.log("Upgrading action", action.name, "of", resource.name, "to", value, ": coap://", resource.ip + action.actionPath);
                resourceService.setState(resource.ip, action.actionPath, getPayload(action.type, value), data => {
                    updateValue(action, data);
                    res.json({ value: action.parameter.current });
                    eventEmitter.emit('update', resources);
                }, console.log.bind(this, "Could not update state."));
                return;
            }
        }
        res.status(400).send({ message: "Action " + actionId + " does not exist (resourceId: " + resourceId + ")" })
    }
};

/**
 * 
 * @param {... String} hosts - array of host ips 
 * @param {Function} completion
 * 
 */
function loadResources(hosts, completion) {
    if (hosts.length === 0) {
        console.log(JSON.stringify(resources));
        completion();
        return;
    }
    loadResource(hosts[0], loadResources.bind(this, hosts.slice(1), completion));
}

function loadResource(hostname, callback) {
    resourceService.discover(hostname, function (actions) {
        const resource = {};
        resource.id = uuid();
        resource.name = "Node " + (resources.length + 1).toString();
        resource.state = "OPEN";
        resource.ip = hostname;
        resource.actions = [];
        for (let action of actions) {
            const processedAction = processAction(action);
            if (processedAction != undefined) {
                resource.actions.push(processedAction);
            }
        }
        resources.push(resource);
        callback();
    }, function () {
        console.error("Could not load", hostname);
        callback();
    });
}

function processAction(rawAction) {
    const action = {};
    action.id = uuid();
    action.actionPath = rawAction.url;
    action.name = rawAction.name || action.actionPath.split("/").join(" ").trim();
    if (rawAction.rt == "LED") {
        action.type = "SWITCH";
        const parameter = {};
        parameter.current = parseInt(rawAction.val);
        parameter.on = 1;
        parameter.off = 0;
        action.parameter = parameter;
        return action;
    }
    console.log("Unknown action type " + rawAction.rt);
    return undefined;
}

exports.start = function (completion) {
    let objs = [];
    for (let res of resources) {
        for (let action of res.actions) {
            objs.push({
                resourceId: res.id,
                ip: res.ip,
                action: action
            });
        }
    }

    const isDebugMode = process.argv.indexOf("--d") !== -1;
    console.log(isDebugMode ? "Debug mode" : "Release mode");
    if (!isDebugMode) {
        loadResources(RESOURCE_IPS, completion);
    } else {
        resources.push(dummyResource);
        for (let res of resources) {
            res.ip = "vs0.inf.ethz.ch";
            for (let action of res.actions) {
                action.actionPath = "/large-post";
            }
        }
        console.log("Initialized resources to large-post api @ethz.ch");
        completion();
    }
};

exports.on = function (eventKey, callback) {
    eventEmitter.on(eventKey, callback);
}