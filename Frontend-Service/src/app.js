const express = require('express');
const app = express();

const img = 'data:image/jpeg;base64,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';
require('./utils/imageProcessor').getDominantColors(img, 2);

module.exports = app;