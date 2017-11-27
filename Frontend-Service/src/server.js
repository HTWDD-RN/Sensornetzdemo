var cors = require('cors');
var app = require('./app');
var port = process.env.PORT || 5238;
var bodyParser = require('body-parser');

// allow all origins
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./routes/routes');
routes(app);
app.use(function (req, res) {
    res.status(404).send({ url: req.originalUrl + ' not found' });
});

app.listen(port,
    console.log.bind(this,"Sensornetzdemo REST API server started on port", port));
