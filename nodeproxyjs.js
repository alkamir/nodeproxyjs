var net = require('net');
var fs = require('fs');


var LOCAL_PORT  = 2020;
var REMOTE_PORT = 2022;
var REMOTE_ADDR = "127.0.0.1";

var server = net.createServer(function (socket) {

    var writeStream = fs.createWriteStream('./proxy__log.txt');
    var writeStreamPure = fs.createWriteStream('./proxyPure__log.txt');

    // This is here incase any errors occur
    writeStream.on('error', function (err) {
        console.log(err);
    });
    
    // This is here incase any errors occur
    writeStreamPure.on('error', function (err) {
        console.log(err);
    });
  
  
    socket.on('data', function (msg) {
        console.log('  ** START **');
        console.log('<< From client to proxy ', msg.toString());
        var serviceSocket = new net.Socket();
        serviceSocket.connect(parseInt(REMOTE_PORT), REMOTE_ADDR, function () {
            console.log('>> From proxy to remote', msg.toString());
            serviceSocket.write(msg);
        });
        serviceSocket.on("data", function (data) {
            console.log('<< From remote to proxy', data.toString());
            
            //Raw
            var Pure = new Buffer(data);
            writeStreamPure.write( new Buffer(Pure.toString('utf-8')) );
            
            // Logged
            var buffer = new Date().toISOString()+'>>>|'+data.toString('utf-8')+'|<<<';
            writeStream.write(buffer);
            
            socket.write(data);
            console.log('>> From proxy to client', data.toString());
        });
    });
});

/*
//******** TCP NODE SERVER FOR TEST
var tcpServerPort = REMOTE_PORT;
// a simple TCP server for testing
var serverTest = net.createServer(function (sockeTest) {
    console.log('Client connected to server');

    sockeTest.on('close', function () {
        console.log('Client disconnected from server');
    });

    sockeTest.on('data', function (buffer) {
        // 'echo' server
        sockeTest.write(buffer);
    });

    sockeTest.on('error', function (err) {
        console.log('Error: ' + err.soString());
    });
});
serverTest.listen(tcpServerPort);
*/

server.listen(LOCAL_PORT);
console.log("TCP server accepting connection on port: " + LOCAL_PORT);