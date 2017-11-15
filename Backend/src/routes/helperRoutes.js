'use strict';

module.exports = function (app) {
    var helper = require('../controllers/helperController');

    //helper routes
    app.route('/healthCheck').get(helper.get_api_status);
}