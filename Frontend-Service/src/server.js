var cors = require('cors');
var app = require('./app');
var port = process.env.PORT || 5238;
var bodyParser = require('body-parser');
var resourceController = require('./controllers/resourceController');

// allow all origins
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./routes/routes');
routes(app);
app.use(function (req, res) {
    res.status(404).send({ url: req.originalUrl + ' not found' });
});

resourceController.start(() => {
    console.log("Turned all LEDs off and updated state.");
    app.listen(port,
        console.log.bind(this, "REST API server started on port", port));
});