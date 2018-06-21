// server.js
var express = require('express');  

const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('server_certificate_docker/serverkey.pem', 'utf8'),
  cert: fs.readFileSync('server_certificate_docker/servercert.pem', 'utf8'),
  ca: fs.readFileSync('server_certificate_docker/cacert.pem', 'utf8')
};

var app = express();
var server = https.createServer(options, app);
var io = require('socket.io')(server);

//var coap = require('coap');

const BORDER_ROUTER_IP = '2001:db8::5841:1f19:c2b6:b792';
const NODE1_IP = '2001:db8::585b:2819:6ba4:50b2';
const NODE2_IP = '2001:db8::585b:1801:4b51:d932';
const NODE3_IP = '2001:db8::585f:1b3c:ad00:1726';
const NODE4_IP = '2001:db8::585a:1f03:382e:891a';

// NODE 1: coap://[2001:db8::585b:2819:6ba4:50b2]:5683/LED/fft   ff02::1#5&128,22,198,10;
// NODE 2: coap://[2001:db8::585b:1801:4b51:d932]:5683/LED/fft   ff02::1#5&0,5,0,64;        fe80::585b:1801:4b51:d932

app.use(express.static(__dirname + '/public'));
//redirect / to our index.html file
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/public/index.html');
});

const coap = require('./src/services/coapService');
const resServ = require('./src/services/resourceService');

io.on('connection', function(client) {
	//when the server receives fft message, do this
    client.on('fft', function(data) {
    	console.log('fft button has been clicked ...');

      //resServ.discover(NODE_IP);
      //console.log("coap.discover: ", resServ);

      //resServ.multicast(BORDER_ROUTER_IP, '/LED/fft', );
      //exports.multicast = function (ip, actionPath, data, success, fail) {

      //console.log(">>>>>>>>> before coap.post()");
      //coap.post(NODE_IP, '/LED/fft', 'ff02::1#5&0,0,0,32;\n', 'text/plain');

    });

    client.on('message', function(message) {
    	


      for(var i = 0; i<16; i++)
      {
        message[i] = message[i].toString(16).toUpperCase();
        // padding of hex values, blocks of 6 values are required
        while (message[i].length < 6) {message[i] = "0" + message[i];}
      }

      console.log(message);

      // TODO
  		// implement connection to coap to send data to BR

      coap.post(NODE1_IP, '/LED/fft', 'ff02::1#5'+message[0]+message[1]+message[2]+message[3]+';\n', 'text/plain');
      coap.post(NODE2_IP, '/LED/fft', 'ff02::1#5'+message[4]+message[5]+message[6]+message[7]+';\n', 'text/plain');

      coap.post(NODE3_IP, '/LED/fft', 'ff02::1#5'+message[8]+message[9]+message[10]+message[11]+';\n', 'text/plain');
      coap.post(NODE4_IP, '/LED/fft', 'ff02::1#5'+message[12]+message[13]+message[14]+message[15]+';\n', 'text/plain');

    });
});

//start our web server and socket.io server listening
server.listen(3000, function(){
  console.log('listening on *:3000');
}); 
