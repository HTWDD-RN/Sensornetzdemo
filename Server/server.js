/*
  server.js
*/

var express = require('express');  
const https = require('https');
const fs = require('fs');

/*
  load self-signed-certificate
*/
const options = {
  key: fs.readFileSync('server_certificate_docker/serverkey.pem', 'utf8'),
  cert: fs.readFileSync('server_certificate_docker/servercert.pem', 'utf8'),
  ca: fs.readFileSync('server_certificate_docker/cacert.pem', 'utf8')
};

/*
  setup express app and https-server with socket.io
*/
var app = express();
var server = https.createServer(options, app);
var io = require('socket.io')(server);


/*
  ip_addresses
**************/

// scope global unicast
///////////////////////
const BORDER_ROUTER_IP = '2001:db8::5841:1f19:c2b6:b792';

const NODE1_IP = '2001:db8::585b:2819:6ba4:50b2';
const NODE2_IP = '2001:db8::585b:1801:4b51:d932';
const NODE3_IP = '2001:db8::585f:1b3c:ad00:1726';
const NODE4_IP = '2001:db8::585a:1f03:382e:891a';
const NODE5_IP = '2001:db8::585b:1238:1c33:b366';
const NODE6_IP = '2001:db8::585b:2c75:46f8:9fbe';
const NODE7_IP = '2001:db8::585a:2704:6caf:16ba';
const NODE8_IP = '2001:db8::585b:2b2f:c1dd:98c6';
const NODE_IPs = [NODE1_IP, NODE2_IP, NODE3_IP, NODE4_IP, NODE5_IP, NODE6_IP, NODE7_IP, NODE8_IP];


// scope global multicast
/////////////////////////
const MULTICAST_IP = 'ff0e::1'; //'ff02::1';


app.use(express.static(__dirname + '/public'));

/*
  Frontend _ redirect to index.html file
**********/
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/public/index.html');
});

/*
  node-coap library
*/
const coap = require('./src/services/coapService');
const resServ = require('./src/services/resourceService');


const routing = [];
var numOfNodes;
var buffer_length;
var payload = '';


/*
  socket.io connection
*/
io.on('connection', function(client) {

  /*
    routing strategie
  */
  client.on('settings_routing', function(data) {
    routing[0] = data.data[0]; // unicast
    routing[1] = data.data[1]; // multicast

    console.log('settings_routing: ' + routing);
  });

  /*
    buffer_length
    number of nodes
  */
  client.on('settings_slider', function(data) {
    buffer_length = Math.pow(2,data.data[0])/2; // fft_size/2 ... due to time and frequency domain
    numOfNodes = data.data[1];

    console.log('settings _ buf len: ' + buffer_length);
    console.log('settings _ numOfNodes: ' + numOfNodes);
  });

  /*
    light switch
  */
  client.on('setting_light', function(data){

  	console.log('Switch ' + data.data);

    // unicast
    //////////
    if(routing[0])
    {
      // put the payload together
      for(var i=0; i<numOfNodes; i++)
      {
        payload = '';

        if(data.data)
            payload += NODE_IPs[i]+'&'+1+'&'+'ffffff';
          else
            payload += NODE_IPs[i]+'&'+1+'&'+'000000';

        console.log("number_of_nodes ", numOfNodes, "payload_u ", payload);

        coap.post(NODE_IPs[i], '/LED/animation', payload, 'text/plain');
      }


    // multicast
    ////////////
    }else if(routing[1])
    {
      payload = '';

      // put the payload together
      for(var i=0; i<numOfNodes; i++)
      {
        if(data.data)
            payload += NODE_IPs[i]+'&'+1+'&'+'ffffff';
          else
            payload += NODE_IPs[i]+'&'+1+'&'+'000000';

        if(i < (numOfNodes-1))
          payload += '#';
      }

      console.log("number_of_nodes ", numOfNodes, "payload_m ", payload);

      coap.post(BORDER_ROUTER_IP, '/LED/animation', payload, 'text/plain');
    }
  });

  /*
    fft messages
  */
  client.on('message', function(message) {
  	
    // specify action type _ fft = 5
    var actionType = 5;


    // input types:
    //
    // unicast:   ipv6 global scope IP (node) + action_type + payload
    //            2001:db8::585b:2819:6ba4:50b2 + action_type + payload

    // package to all nodes, but specific payload for specific node
    // multicast: ipv6 global scope IP (border-router) + action_type + node related payload
    //            2001:db8::585b:2819:6ba4:50b2 + action_type + payload
    //            payload: (needs to be parsed on microCoapServer)
    //                2001:db8::5841:1f19:c2b6:b792 + action_type + payload
    //                2001:db8::585b:1801:4b51:d932 + action_type + payload
    //                2001:db8::585f:1b3c:ad00:1726 + action_type + payload
    //                ...


    // unicast
    //////////
    if(routing[0]){

      // payload example:
    	// payload  2001:db8::585b:2819:6ba4:50b2&5&1e0a00
	    // payload  2001:db8::585b:1801:4b51:d932&5&000203

      // put the payload together
      for(var i=0; i<numOfNodes; i++)
      {
        payload = '';

        payload += NODE_IPs[i]+'&'+actionType+'&'+message[i];

        console.log("number_of_nodes ", numOfNodes, "payload_u ", payload);

        coap.post(NODE_IPs[i], '/LED/fft', payload, 'text/plain');
      }


    // multicast
    ////////////
    }else if(routing[1]){

      // payload example:
		  // 2001:db8::585b:2819:6ba4:50b2&5&685d00#2001:db8::585b:1801:4b51:d932&5&005a5a

      payload = '';

      // put the payload together
      for(var i=0; i<numOfNodes; i++)
      {
        payload += NODE_IPs[i]+'&'+actionType+'&'+message[i];

        if(i < (numOfNodes-1))
          payload += '#';
      }

      console.log("number_of_nodes ", numOfNodes, "payload_m ", payload);
      coap.post(BORDER_ROUTER_IP, '/LED/fft', payload, 'text/plain');
    }
  });
});

/*
  start web server and socket.io server listening
*/
server.listen(3000, function(){
  console.log('listening on *:3000');
}); 
