#!/usr/bin/env node


// Module dependencies
var http = require('http');
var dispatcher = require('httpdispatcher');
var health = require('./health');

if (process.argv[2] == '--version' || process.argv[2] == '-v') {
  var packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'));
  console.log('v' + packageJson.version);
  process.exit(0);
}

dispatcher.onGet("/status", function(req, res) {
    var agent = new health();
    agent.getMetrics( function(status) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(status));
    });

});

function handleRequest(request, response){
    try {
        //log the request on console
        console.log(request.url);
        //Disptach
        dispatcher.dispatch(request, response);
    } catch(err) {
        console.log(err);
    }
}


function cli (args) {
    console.log("port is " + args.port);
    var server = http.createServer(handleRequest);
    server.listen(args.port, function(){
        console.log("Server listening on port ", args.port);
    });
}

function parseArgs(argv) {
    var args = {};

    if(argv.length >= 1)
        args.port = argv[argv.length -1];

    /*
    process.argv.forEach(function (val, index, array) {
        args
    });
    */

    return args;
}

if (require.main === module) {
    args = parseArgs(process.argv.slice(2));
    cli(args);
}
