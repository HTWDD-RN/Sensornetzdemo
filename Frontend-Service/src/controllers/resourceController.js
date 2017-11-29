'use strict';

const ipAddress = "2001:db8::5855:1277:fb88:4f1e";

const resourceService = require('../services/resourceService');

const r1 = {
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
                current: 1,
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
                current: 1,
                on: 0,
                off: 1
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
                current: 1,
                on: 1,
                off: 0
            }
        }
    ]
};

const resources = [
    r1
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

exports.update_resource = function (req, res) {
    const resourceId = req.params.resourceId;
    const actionId = req.params.actionId;
    const value = parseInt(req.body.value);
    if (isNaN(value) || (value != 0 && value != 1)) {
        var message = "Non-numeric value";
        if (!req.body.value) {
            message = "No value";
        } else if (!isNaN(value)) {
            message = "Provide valid value: [0,1]"
        }
        res.status(400).send({ message: message });
        return;
    }
    const resource = findResourceById(resourceId);
    if (!resource) {
        sendResourceNotFoundResponse(res, resourceId);
    } else {
        for (var i = 0; i < resource.actions.length; i++) {
            const action = resource.actions[i];
            if (action.id == actionId) {
                resourceService.setState(resource.ip, action.actionPath, value.toString(), data => {
                    action.parameter.current = parseInt(data);
                    res.json({ value: action.parameter.current });
                });
                return;
            }
        }
        res.status(400).send({ message: "Action " + actionId + " does not exist (resourceId: " + resourceId + ")" })
    }
};

exports.start = function () {
    for (var i = 0; i < resources.length; i++) {
        const res = resources[i];
        for (var j = 0; j < res.actions.length; j++) {
            const action = res.actions[j];
            resourceService.setState(res.ip, action.actionPath, "1", data => {
                action.parameter.current = parseInt(data);
            });
        }
    }
}