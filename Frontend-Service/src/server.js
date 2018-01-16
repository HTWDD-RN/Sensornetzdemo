var cors = require('cors');
var imagesUpload = require('images-upload-middleware').default;
var app = require('./app');
var port = process.env.PORT || 5238;
var bodyParser = require('body-parser');
var resourceController = require('./controllers/resourceController');
var websocketService = require('./services/websocketService');
const http = require('http');

// allow all origins
app.use(cors());
app.post('/imageUpload', imagesUpload(
    './static/img',
    'http://localhost:5238/static/img',
    true,
    false
));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./routes/routes');
routes(app);
app.use(function (req, res) {
    res.status(404).send({ url: req.originalUrl + ' not found' });
});

resourceController.start(() => {
    console.log("Turned all LEDs off and updated state.");
    resourceController.on("update", function (data) {
        console.log("Broadcasting", JSON.stringify(data));
        websocketService.broadcast(JSON.stringify(data));
    });
    const server = http.createServer(app);
    websocketService.init(server);
    server.listen(port,
        console.log.bind(this, "REST API server started on port", port));
});