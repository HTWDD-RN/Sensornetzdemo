var app = require('./app');
var port = process.env.PORT || 5238;
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./routes/helperRoutes');
routes(app);
// middleware for header modification
app.use((req, res, next) => {
    // we need to allow all subdomains
    res.set('Access-Control-Allow-Origin', '*');
    next();
});
app.use(function (req, res) {
    res.status(404).send({ url: req.originalUrl + ' not found' });
});

app.listen(port,
    console.log.bind(this,"Sensornetzdemo REST API server started on port", port));

