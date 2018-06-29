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

// global unicast
const BORDER_ROUTER_IP = '2001:db8::5841:1f19:c2b6:b792';

const NODE1_IP = '2001:db8::585b:2819:6ba4:50b2';
const NODE2_IP = '2001:db8::585b:1801:4b51:d932';
const NODE3_IP = '2001:db8::585f:1b3c:ad00:1726';
const NODE4_IP = '2001:db8::585a:1f03:382e:891a';

const NODE_IPs = [NODE1_IP, NODE2_IP, NODE3_IP, NODE4_IP];


// multicast
const MULTICAST_IP = 'ff02::1';

// link local unicast: fe80::/64 local network scope: from networksegments until the first router
// global multicast: ff0e::1

// NODE 1: coap://[2001:db8::585b:2819:6ba4:50b2]:5683/LED/fft   ff02::1#5&128,22,198,10;
// NODE 2: coap://[2001:db8::585b:1801:4b51:d932]:5683/LED/fft   ff02::1#5&0,5,0,64;        fe80::585b:1801:4b51:d932

app.use(express.static(__dirname + '/public'));
//redirect / to our index.html file
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/public/index.html');
});

const coap = require('./src/services/coapService');
const resServ = require('./src/services/resourceService');

const routing = [];

io.on('connection', function(client) {

	//when the server receives fft message, do this
    client.on('settings', function(data) {
      routing[0] = data.data[0];
      routing[1] = data.data[1];
      routing[2] = data.data[2];

      console.log('settings: ' + routing);
    });

    client.on('message', function(message) {
    	
      var actionType = 5;

      // number of nodes
      var numOfNodes = 4;
      // number of LEDs per node
      var numOfPix = 4;

      for(var i = 0; i<16; i++)
      {
        message[i] = message[i].toString(16).toUpperCase();
        // padding of hex values, blocks of 6 values are required e.g. FFFFFF
        while (message[i].length < 6) {message[i] = "0" + message[i];}
      }

      console.log(message);

  		// connection to coap to send data to BR

      // input types:
      // unicast:   ipv6 global scope IP (node) + payload
      //            2001:db8::585b:2819:6ba4:50b2 + payload

      // same package to all nodes
      // multicast: ipv6 global scope IP (border-router) + payload
      //            2001:db8::585b:2819:6ba4:50b2 + payload

      // package to all nodes, but specific payload for specific node
      // multicast: ipv6 global scope IP (border-router) + node related payload
      //            2001:db8::585b:2819:6ba4:50b2 + payload
      //            payload: (needs to be parsed on microCoapServer)
      //                2001:db8::5841:1f19:c2b6:b792 + payload
      //                2001:db8::585b:1801:4b51:d932 + payload
      //                2001:db8::585f:1b3c:ad00:1726 + payload
      //                ...

      // unicast -> intensity values
      if(routing[0]){


      // multicast -> colored values, same package to all nodes
      }else if(routing[1]){


      // multicast -> colored values, package to all nodes but -> specific payload for specific node
      }else if(routing[2]){


      }


      var payload = '';
      // put the payload together
      for(var i=0; i<numOfNodes; i++)
      {
        payload += NODE_IPs[i]+'&'+actionType+'&';
        
        var tmp_msg = '';
        for(var j=i*numOfNodes; j<(i+1)*numOfPix; j++)
          tmp_msg += message[i];

        if(i < (numOfNodes-1))
          payload += tmp_msg + '#';
        else if(i == (numOfNodes-1))
          payload += tmp_msg;
      }

      coap.post(BORDER_ROUTER_IP, '/LED/fft', payload, 'text/plain');
      
      //coap.post(MULTICAST_IP, '/LED/fft', 'ff02::15'+message[4]+message[5]+message[6]+message[7], 'text/plain');

      //coap.post(NODE1_IP, '/LED/fft', '5'+message[0]+message[1]+message[2]+message[3], 'text/plain');
      //coap.post(NODE2_IP, '/LED/fft', '5'+message[4]+message[5]+message[6]+message[7], 'text/plain');
      //coap.post(NODE3_IP, '/LED/fft', '5'+message[8]+message[9]+message[10]+message[11], 'text/plain');
      //coap.post(NODE4_IP, '/LED/fft', '5'+message[12]+message[13]+message[14]+message[15], 'text/plain');

    });
});

//start our web server and socket.io server listening
server.listen(3000, function(){
  console.log('listening on *:3000');
}); 
