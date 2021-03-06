"use strict";

const fs = require("fs");
const resourceService = require("../services/resourceService");
const events = require("events");
const eventEmitter = new events.EventEmitter();
const uuid = require("uuid/v4");
const imageProcessor = require("../utils/imageProcessor");
const Color = require("onecolor");

/* Resources and border router */
const BORDER_ROUTER_IP = "2001:db8::5855:1277:fb88:4f1e";
const RESOURCE_IPS = ["2001:db8::585a:2704:6caf:16ba"];

/* Animation mapping */
const animationTypes = {
  None: {
    parameter: '',
    idx: 0
  },
  "Set Color": {
    parameter: '16711680',
    idx: 1
  },
  "Moving Light": {
    parameter: '65280',
    idx: 2
  },
  "HSV Color": {
    parameter: '100',
    idx: 3
  },
  "Light Waves": {
    parameter: '',
    idx: 4
  }
};

/* Static resources */
const dummyResource = {
  id: "led_a",
  name: "Node A",
  state: "OPEN",
  ip: "2001:db8::585a:1f03:382e:891a",
  actions: [
    {
      id: "led_a_4",
      name: "RGB",
      type: "COLOR_RANGE",
      actionPath: "/LED/strip",
      parameter: {
        min: 0x000000,
        max: 0xffffff,
        current: 0x7f7f7f
      }
    }, {
      id: "led_a_5",
      name: "Animation",
      type: "ANIMATION",
      actionPath: "/LED/animation",
      parameter: {
        options: [
          "None",//no parameter
          "Set Color", //decimal color parameter
          "Moving Light", //decimal color parameter
          "HSV Color", //intensity (0-100)
          "Light Waves" //no parameter
        ],
        current: "None"
      }
    }
  ]
};

const r1 = {
  id: "led_1",
  name: "NODE A",
  state: "OPEN",
  ip: "fe80::585b:2c75:46f8:9fbe",
  actions: [
    {
      id: "led_1_1",
      name: "RGB",
      type: "COLOR_RANGE",
      actionPath: "/LED/strip",
      parameter: {
        min: 0x000000,
        max: 0xffffff,
        current: 0x7f7f7f
      }
    },
    {
      id: "led_1_2",
      name: "Animation",
      type: "ANIMATION",
      actionPath: "/LED/animation",
      parameter: {
        options: [
          "None",//no parameter
          "Set Color", //decimal color parameter
          "Moving Light", //decimal color parameter
          "HSV Color", //intensity (0-100)
          "Light Waves" //no parameter
        ],
        current: "None"
      }
    }
  ]
};

const r2 = {
  id: "led_1",
  name: "NODE B",
  state: "OPEN",
  ip: "fe80::585f:1b3c:ad00:1726",
  actions: [
    {
      id: "led_2_1",
      name: "RGB",
      type: "COLOR_RANGE",
      actionPath: "/LED/strip",
      parameter: {
        min: 0x000000,
        max: 0xffffff,
        current: 0x7f7f7f
      }
    },
    {
      id: "led_2_2",
      name: "Animation",
      type: "ANIMATION",
      actionPath: "/LED/animation",
      parameter: {
        options: [
          "None",//no parameter
          "Set Color", //decimal color parameter
          "Moving Light", //decimal color parameter
          "HSV Color", //intensity (0-100)
          "Light Waves" //no parameter
        ],
        current: "None"
      }
    }
  ]
};

const r3 = {
  id: "led_3",
  name: "NODE C",
  state: "OPEN",
  ip: "fe80::585b:2819:6ba4:50b2",
  actions: [
    {
      id: "led_3_1",
      name: "RGB",
      type: "COLOR_RANGE",
      actionPath: "/LED/strip",
      parameter: {
        min: 0x000000,
        max: 0xffffff,
        current: 0x7f7f7f
      }
    },
    {
      id: "led_3_2",
      name: "Animation",
      type: "ANIMATION",
      actionPath: "/LED/animation",
      parameter: {
        options: [
          "None",//no parameter
          "Set Color", //decimal color parameter
          "Moving Light", //decimal color parameter
          "HSV Color", //intensity (0-100)
          "Light Waves" //no parameter
        ],
        current: "None"
      }
    }
  ]
};

const r4 = {
  id: "led_4",
  name: "NODE D",
  state: "OPEN",
  ip: "fe80::585a:1f03:382e:891a",
  actions: [
    {
      id: "led_4_1",
      name: "RGB",
      type: "COLOR_RANGE",
      actionPath: "/LED/strip",
      parameter: {
        min: 0x000000,
        max: 0xffffff,
        current: 0x7f7f7f
      }
    },
    {
      id: "led_4_2",
      name: "Animation",
      type: "ANIMATION",
      actionPath: "/LED/animation",
      parameter: {
        options: [
          "None",//no parameter
          "Set Color", //decimal color parameter
          "Moving Light", //decimal color parameter
          "HSV Color", //intensity (0-100)
          "Light Waves" //no parameter
        ],
        current: "None"
      }
    }
  ]
};

const r5 = {
  id: "led_5",
  name: "NODE E",
  state: "OPEN",
  ip: "fe80::585b:1801:4b51:d932",
  actions: [
    {
      id: "led_5_1",
      name: "RGB",
      type: "COLOR_RANGE",
      actionPath: "/LED/strip",
      parameter: {
        min: 0x000000,
        max: 0xffffff,
        current: 0x7f7f7f
      }
    },
    {
      id: "led_5_2",
      name: "Animation",
      type: "ANIMATION",
      actionPath: "/LED/animation",
      parameter: {
        options: [
          "None",//no parameter
          "Set Color", //decimal color parameter
          "Moving Light", //decimal color parameter
          "HSV Color", //intensity (0-100)
          "Light Waves" //no parameter
        ],
        current: "None"
      }
    }
  ]
};

const r6 = {
  id: "led_6",
  name: "NODE F",
  state: "OPEN",
  ip: "fe80::585a:2704:6caf:16ba",
  actions: [
    {
      id: "led_6_1",
      name: "RGB",
      type: "COLOR_RANGE",
      actionPath: "/LED/strip",
      parameter: {
        min: 0x000000,
        max: 0xffffff,
        current: 0x7f7f7f
      }
    },
    {
      id: "led_6_2",
      name: "Animation",
      type: "ANIMATION",
      actionPath: "/LED/animation",
      parameter: {
        options: [
          "None",//no parameter
          "Set Color", //decimal color parameter
          "Moving Light", //decimal color parameter
          "HSV Color", //intensity (0-100)
          "Light Waves" //no parameter
        ],
        current: "None"
      }
    }
  ]
};

const r7 = {
  id: "led_7",
  name: "NODE G",
  state: "OPEN",
  ip: "fe80::585b:1238:1c33:b366",
  actions: [
    {
      id: "led_7_1",
      name: "RGB",
      type: "COLOR_RANGE",
      actionPath: "/LED/strip",
      parameter: {
        min: 0x000000,
        max: 0xffffff,
        current: 0x7f7f7f
      }
    },
    {
      id: "led_7_2",
      name: "Animation",
      type: "ANIMATION",
      actionPath: "/LED/animation",
      parameter: {
        options: [
          "None",//no parameter
          "Set Color", //decimal color parameter
          "Moving Light", //decimal color parameter
          "HSV Color", //intensity (0-100)
          "Light Waves" //no parameter
        ],
        current: "None"
      }
    }
  ]
};

const dummyResource2 = {
  id: "led_b",
  name: "Node B",
  state: "OPEN",
  ip: "2001:db8::585b:1801:4b51:d932",
  actions: [
    {
      id: "led_b_4",
      name: "RGB",
      type: "COLOR_RANGE",
      actionPath: "/LED/strip",
      parameter: {

      }
    }
  ]
};
const multicastResource = {
  id: "led_m",
  name: "Multicast",
  state: "OPEN",
  ip: "ff02::1",
  actions: [
    {
      id: "led_m_1",
      name: "RGB",
      type: "COLOR_RANGE",
      actionPath: "/LED/strip",
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
        current: "",
        colors: [],
        base64: ""
      }
    },
    {
      id: "demo_resource_color_sequence_multicast",
      name: "Color Sequence - Multicast",
      type: "COLOR_SEQUENCE_MULTICAST",
      parameter: {
        color: 0x7f7f7f,
        isRunning: false
      }
    }
  ]
};

const resources = [];

/**
 * Find resource by given id.
 * 
 * @param {string} id the resource id
 * @returns resource object if found, null otherwise
 */
const findResourceById = function (id) {
  for (var i = 0; i < resources.length; i++) {
    const resource = resources[i];
    if (resource.id == id) {
      return resource;
    }
  }
  return null;
};

/**
 * Get IP Address of action parent node.
 * 
 * @param {string} id the action id
 * @returns ip address if found, null otherwise
 */
const getIpByActionId = function (id) {
  for (let resource of resources) {
    for (let action of resource.actions) {
      if (action.id == id) {
        return resource.ip;
      }
    }
  }
  return null;
};

/**
 * Find action by given id.
 * 
 * @param {string} id the action id
 * @returns action object if found, null otherwise
 */
const findActionById = function (id) {
  for (let resource of resources) {
    for (let action of resource.actions) {
      if (action.id == id) {
        return action;
      }
    }
  }
  return null;
};

/**
 * Get all actions by given type.
 * 
 * @param {string} type the type 
 * @returns array of actions
 */
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
};

/**
 * Send resource not found response.
 * 
 * @param {*} res 
 * @param {*} id 
 */
const sendResourceNotFoundResponse = function (res, id) {
  res.status(400).send({ message: "Resource " + id + " not found" });
};

/**
 * Send response providing all resources.
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.get_resources = function (req, res) {
  const response = { response: resources };
  res.json(response);
};

/**
 * Find action by resourceId request parameter and respond with resource data.
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.get_resource = function (req, res) {
  const id = req.params.resourceId;
  const resource = findResourceById(id);
  if (!resource) {
    sendResourceNotFoundResponse(res, id);
  } else {
    res.json({ response: resource });
  }
};

/**
 * Validate whether PUT payload (value to be set) is valid for given action.
 * 
 * @param {object} action the action
 * @param {object} value the payload value
 * @returns boolean
 */
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
    //TODO: check whether image exists
    return true;
  } else if (action.type == "COLOR_SEQUENCE_UNICAST" || action.type == "COLOR_SEQUENCE_MULTICAST") {
    const data = value.split("#");
    return data.length == 2 && (data[0] == "true" || data[0] == "false") && !Number.isNaN(parseInt(data[1]));
  } else if (action.type == "ANIMATION") {
    return action.parameter.options.indexOf(value) !== -1;
  }

  console.log("Unknown action", action.type);
  return false;
}

/**
 * Update current status of an action.
 * 
 * @param {object} action the action to update
 * @param {object} value  the value to set
 */
function updateValue(action, value) {
  if (action.type == "SWITCH") {
    action.parameter.current = parseInt(value);
  } else if (action.type == "RANGE") {
    action.parameter.current = parseInt(value);
  } else if (action.type == "COLOR_RANGE") {
    action.parameter.current = parseInt(value);
  } else if (action.type == "ANIMATION") {
    action.parameter.current = value;
  } else if (action.type == "IMAGE_TO_COLOR") {
    action.parameter.current = value;
    imageProcessor.encodeBase64(value, 400, function (data) {
      action.parameter.colors = [];
      action.parameter.base64 = data;
      const containerCount = Math.max(
        findActionsByType("COLOR_RANGE").length,
        72
      );
      if (containerCount === 0) {
        return;
      }
      imageProcessor.getDominantColors(
        data,
        containerCount,
        function (actionId, data) {
          const action = findActionById(actionId);
          for (let clr of data) {
            const hex = new Color(
              "rgb(" + clr.r + "," + clr.g + "," + clr.b + ")"
            )
              .hex()
              .replace("#", "0x");
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
          eventEmitter.emit("update", resources);
          resourceService.multicast(BORDER_ROUTER_IP, rgbActions[0].actionPath, parameter, console.log, console.log);
        }.bind(this, action.id)
      );
    });
  } else if (action.type == "COLOR_SEQUENCE_UNICAST") {
    const isRunning = value.split("#")[0];
    const color = parseInt(value.split("#")[1]);
    action.parameter.isRunning = isRunning == "true" ? true : false;
    action.parameter.color = color;

    const actions = findActionsByType("COLOR_RANGE");
    for (let action of actions) {
      action.parameter.current = color;
      resourceService.setState(BORDER_ROUTER_IP, getIpByActionId(action.id), action.actionPath, getPayload(action.type, action.parameter.current),
        data => { },
        console.log.bind(this, "Could not update state.")
      );
    }

    eventEmitter.emit("update", resources);
  } else if (action.type == "COLOR_SEQUENCE_MULTICAST") {
    const isRunning = value.split("#")[0];
    const color = parseInt(value.split("#")[1]);

    action.parameter.isRunning = isRunning == "true" ? true : false;
    action.parameter.color = color;

    const parameter = [];
    const actions = findActionsByType("COLOR_RANGE");
    for (let action of actions) {
      action.parameter.current = color;
      parameter.push({
        ip: getIpByActionId(action.id),
        payload: action.parameter.current
      });
    }
    resourceService.multicast(BORDER_ROUTER_IP, actions[0].actionPath, parameter, console.log, console.log);

    eventEmitter.emit("update", resources);
  }
}

/**
 * Get payload to be sent to an endpoint (node).
 * 
 * @param {string} actionType the action type 
 * @param {*} value the value to set
 * @returns payload to send
 */
function getPayload(actionType, value) {
  if (actionType == "SWITCH" || actionType == "RANGE" || actionType == "COLOR_RANGE") {
    return value.toString();
  } else if (actionType == "ANIMATION") {
    const idx = animationTypes[value].idx;
    const parameter = animationTypes[value].parameter;
    return idx + "&" + parameter;
  }
  return "";
}

/**
 * Handle PUT requests - validate payload, update action state and send response to the client. 
 * 
 * @param {*} req 
 * @param {*} res 
 */
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
          res.status(400).send({ message: "Invalid value" });
          return;
        }
        if (action.type == "IMAGE_TO_COLOR" || action.type == "COLOR_SEQUENCE_UNICAST" || action.type == "COLOR_SEQUENCE_MULTICAST") {
          //actions that are scripted
          updateValue(action, value);
        } else {
          //actions that are sent directly to the node
          if (action.type == "COLOR_RANGE") {
            for (let singleAction of resource.actions) {
              if (singleAction.type == "ANIMATION" && singleAction.parameter.current != "None") {
                resourceService.setState(BORDER_ROUTER_IP, resource.ip,
                  singleAction.actionPath, getPayload(singleAction.type, "None"));
              }
            }
          }
          console.log("Upgrading action", action.name, "of", resource.name, "to", value, ": coap://" + resource.ip + action.actionPath);
          resourceService.setState(BORDER_ROUTER_IP, resource.ip,
            action.actionPath, getPayload(action.type, value), data => { },
            console.log.bind(this, "Could not update state.")
          );
          updateValue(action, value);
        }
        res.json({ value: action.parameter.current });
        eventEmitter.emit("update", resources);
        return;
      }
    }
    res
      .status(400)
      .send({
        message:
          "Action " +
          actionId +
          " does not exist (resourceId: " +
          resourceId +
          ")"
      });
  }
};

/**
 * Load resources and actions.
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

/**
 * Load and parse single resource.
 * 
 * @param {string} hostname the ip address of host
 * @param {function} callback the callback to call after request was completed
 */
function loadResource(hostname, callback) {
  console.log("Loading resources of ", hostname);
  resourceService.discover(hostname, function (contentType, actions) {
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
    console.log("Loaded", resource.actions.length, "actions of", hostname);
    callback();
  },
    function () {
      console.error("Could not load", hostname);
      callback();
    }
  );
}

/**
 * Transform raw action according to project (API) data specification.
 * 
 * @param {object} rawAction the action as provided by /.well-known/core
 */
function processAction(rawAction) {
  const action = {};
  action.id = uuid();
  action.actionPath = rawAction.url;
  action.name = rawAction.name || action.actionPath.split("/").join(" ").trim();
  if (rawAction.rt == "switch") {
    action.type = "SWITCH";
    const parameter = {};
    parameter.current = 0;
    parameter.on = 1;
    parameter.off = 0;
    action.parameter = parameter;
    return action;
  } else if (rawAction.rt == "rgb") {
    action.type = "COLOR_RANGE";
    const parameter = {};
    parameter.min = 0x000000;
    parameter.max = 0xffffff;
    parameter.current = 0x7f7f7f;
    action.parameter = parameter;
    return action;
  } else if (rawAction.rt == "animation") {
    action.type = "ANIMATION";
    const parameter = {};
    const options = Object.keys(animationTypes);
    parameter.options = options;
    parameter.current = options[0];
    action.parameter = parameter;
    return action;
  }
  console.log("Unknown action type " + rawAction.rt);
  return undefined;
}

/**
 * Initialize the controller - load resources.
 * 
 * @param {function} completion callback to call after resource controller has been initialized 
 */
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
  resources.push(multicastResource);
  resources.push(demoResource);
  resources.push(r1);
  resources.push(r2);
  resources.push(r3);
  resources.push(r4);
  resources.push(r5);
  resources.push(r6);
  resources.push(r7);
  /*  if (!isDebugMode) {
      loadResources(RESOURCE_IPS, completion);
    } else {
      resources.push(dummyResource);
      resources.push(dummyResource2);
      completion();
    }*/
  completion();
};

/**
 * Register an event listener.
 * 
 * @param {string} eventKey
 * @param {function} callback 
 */
exports.on = function (eventKey, callback) {
  eventEmitter.on(eventKey, callback);
};
