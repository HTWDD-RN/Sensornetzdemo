'use strict';

var helperRoutes = require('./helperRoutes');
var resourceRoutes = require('./resourceRoutes');

module.exports = function (app) {
    helperRoutes(app);
    resourceRoutes(app);
};