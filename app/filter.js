#!/usr/bin/env node
var winston = require('winston');
winston.level = 'debug';
configureLogging();

var queue = [];
// const host = 'http://13.64.236.113:8545'
const host = 'http://localhost:8545'
const Web3 = require('web3')
const HttpHeaderProvider = require('httpheaderprovider');
//const provider = new HttpHeaderProvider(host);
const provider = new Web3.providers.HttpProvider(host)
const web3 = new Web3(provider);


var cb = function (dd) {
  console.log('callback 1')
  if (dd) console.log(JSON.stringify(dd))
}

var cb2 = function (dd) {
  console.log('callback 2')
}

var accounts = web3.eth.accounts;
var account = accounts[0];

//  'topics':[web3.sha3('newtest(string,uint256,string,string,uint256)')]});
// filter.watch(function(error, result) {
//    ...
// })


var filterOptions = {
  fromBlock:0, toBlock: 'latest',
  topics: [
    web3.sha3('updateContract(string)')
  ]
}

// var filter = web3.eth.filter();
var filter = web3.eth.filter(filterOptions, cb, cb2);

// watch for changes
filter.watch(function (error, result) {
  if (error) {
    console.error("Error: %s", error.message)
    // console.error("Stack: %s", error.stack)
  }
  else {
    console.log("New Block: %s", result);
  }
});

console.log('done...')

//filter.stopWatching();




function configureLogging() {

  winston.setLevels({
    trace: 9,
    input: 8,
    verbose: 7,
    prompt: 6,
    debug: 5,
    info: 4,
    data: 3,
    help: 2,
    warn: 1,
    error: 0
  });

  winston.addColors({
    trace: 'magenta',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    debug: 'blue',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    error: 'red'
  });
  winston.remove(winston.transports.Console)
  winston.add(winston.transports.Console, {
    level: 'trace',
    prettyPrint: true,
    colorize: true,
    silent: false,
    timestamp: false
  });
  winston.warn('log level set to %s', winston.level);
}
