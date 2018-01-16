'use strict';

const fs = require('fs');
const resourceService = require('../services/resourceService');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const uuid = require('uuid/v4');
const imageProcessor = require('../utils/imageProcessor');
const Color = require("onecolor");

const BORDER_ROUTER_IP = "2001:db8::5855:1277:fb88:4f1e";
const RESOURCE_IPS = ["2001:db8::585b:1238:1c33:b366"];

const dummyResource = {
    id: "led_a",
    name: "Node A (LED)",
    state: "OPEN",
    ip: "2001:db8::585b:1238:1c33:b366",
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
            actionPath: '/LED/strip',
            parameter: {
                min: 0x000000,
                max: 0xffffff,
                current: 0x7f7f7f
            }
        }
    ]
};

const demoResource = {
    id: "demo_resource",
    name: "DEMO Node",
    state: "OPEN",
    actions: [
        {
            id: "demo_resource_image",
            name: "Bild hochladen",
            type: "IMAGE_TO_COLOR",
            parameter: {
                current: '',
                colors: [],
                base64: ''
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

const getIpByActionId = function (id) {
    for (let resource of resources) {
        for (let action of resource.actions) {
            if (action.id == id) {
                return resource.ip;
            }
        }
    }
    return null;
}

const findActionById = function (id) {
    for (let resource of resources) {
        for (let action of resource.actions) {
            if (action.id == id) {
                return action;
            }
        }
    }
    return null;
}

const findActionsByType = function (type) {
    const result = [];
    for (let resource of resources) {
        for (let action of resource.actions) {
            if (action.type == type) {
                result.push(action);
            }
        }
    }
    return result;
}

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
        const val = parseInt(value);
        return val >= action.parameter.min && val <= action.parameter.max;
    } else if (action.type == "IMAGE_TO_COLOR") {
        //TODO: check whether valid base64 image
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
        action.parameter.current = parseInt(value);
    } else if (action.type == "IMAGE_TO_COLOR") {
        action.parameter.current = value;
        action.parameter.colors = [];
        action.parameter.base64 = 'data:image/' + value.split(".")[value.split(".").length - 1].toLowerCase() + ';base64,' + fs.readFileSync('./static/img/' + value, { encoding: 'base64' })
        const containerCount = Math.max(findActionsByType("COLOR_RANGE").length, 72);
        if (containerCount === 0) {
            return;
        }
        imageProcessor.getDominantColors(value, containerCount, function (actionId, data) {
            const action = findActionById(actionId);
            for (let clr of data) {
                const hex = new Color("rgb(" + clr.r + "," + clr.g + "," + clr.b + ")").hex().replace("#", "0x");
                action.parameter.colors.push({
                    color: parseInt(hex),
                    dominance: clr.dominance
                });
            }
            const rgbActions = findActionsByType("COLOR_RANGE");
            const parameter = [];
            var propagate = 0;
            var percentagePerNode = 1 / rgbActions.length;
            for (var i = 0; i < rgbActions.length; i++) {
                var val = 0;
                const rgbAction = rgbActions[i];
                for (let color of action.parameter.colors) {
                    val += color.dominance;
                    if (propagate < val) {
                        rgbAction.parameter.current = color.color;
                        parameter.push({
                            ip: getIpByActionId(rgbAction.id),
                            payload: color.color
                        });
                        break;
                    }
                }
                propagate += percentagePerNode;
            }
            eventEmitter.emit('update', resources);
            resourceService.multicast(BORDER_ROUTER_IP, "/LED/stripe", parameter);
        }.bind(this, action.id)); //TODO: update nodes
    }
}

function getPayload(actionType, value) {
    if (actionType == "SWITCH" || actionType == "RANGE" || actionType == "COLOR_RANGE") {
        return value.toString();
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
                if (action.type == "IMAGE_TO_COLOR") { //actions that are scripted
                    updateValue(action, value);
                } else { //actions that are sent directly to the node
                    console.log("Upgrading action", action.name, "of", resource.name, "to", value, ": coap://" + resource.ip + action.actionPath);
                    resourceService.setState(BORDER_ROUTER_IP, resource.ip, action.actionPath, getPayload(action.type, value), data => {
                    }, console.log.bind(this, "Could not update state."));
                    updateValue(action, value);
                }
                res.json({ value: action.parameter.current });
                eventEmitter.emit('update', resources);
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
        completion();
        return;
    }
    loadResource(hosts[0], loadResources.bind(this, hosts.slice(1), completion));
}

function loadResource(hostname, callback) {
    //TODO: add demo node bundling color sequence and image upload functionality
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
    resources.push(demoResource);
    // if (!isDebugMode) {
    //     loadResources(RESOURCE_IPS, completion);
    // } else {
    resources.push(dummyResource);
    // for (let res of resources) {
    //     res.ip = "vs0.inf.ethz.ch";
    //     for (let action of res.actions) {
    //         action.actionPath = "/large-post";
    //     }
    //  }
    console.log("Initialized resources to large-post api @ethz.ch");
    completion();
    //}
};

exports.on = function (eventKey, callback) {
    eventEmitter.on(eventKey, callback);
}
