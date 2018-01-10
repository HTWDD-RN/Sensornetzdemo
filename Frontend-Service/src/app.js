const express = require('express');
const app = express();

require('./utils/imageProcessor').getDominantColors('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',5);

module.exports = app;