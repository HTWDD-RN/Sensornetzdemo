'use strict';

module.exports = function (app) {
    var resourceController = require("../controllers/resourceController");

    //list all resources
    app.route('/').get(resourceController.get_resources);

    //get resource data
    app.route('/:resourceId').get(resourceController.get_resource);

    //update resource state
    app.route('/:resourceId/:actionId').put(resourceController.update_resource);

}