#!/usr/bin/env node
var winston = require('winston');
winston.level = 'debug';
configureLogging();

const ssAbi = require('./app/build/contracts/SimpleStorage.json').abi;

var queue = [];
const host = 'http://localhost:8545'

const Web3 = require('web3')
const HttpHeaderProvider = require('httpheaderprovider');
//const provider = new HttpHeaderProvider(host);
const provider = new Web3.providers.HttpProvider(host)

const web3 = new Web3(provider);

//const eventNameSignature = 'updateContract(string, uint256)';
const eventNameSignatureHash = web3.sha3('updateContract(string)');
console.log("looking for: %s", eventNameSignatureHash)

var filterOptions = {
  fromBlock: 'latest', 
  topics: [
    eventNameSignatureHash
  ]
}

var filterOptions2 = {
  fromBlock: 'latest'
}

// var filterOptions = {
//   fromBlock: 21384, toBlock: 21385
// }

// var filter = web3.eth.filter();
var filter = web3.eth.filter(filterOptions);
var filter2 = web3.eth.filter('latest');

// watch for changes
filter.watch(function (error, logs) {
  if (error) {
    console.error("Error: %s", error.message)
    // console.error("Stack: %s", error.stack)
  }
  else {
    winston.debug("New Log: %s", JSON.stringify(logs));
    var rv = processLog(logs);
    winston.debug("rv: %s", JSON.stringify(rv))
    winston.debug("event: %s:", rv.event)
    winston.debug("args : %s:", JSON.stringify(rv.args))
    winston.debug("=============================\n\n\n")
  }
});

filter2.watch(function (error, logs) {
  if (error) {
    console.error("Error: %s", error.message)
    // console.error("Stack: %s", error.stack)
  }
  else {
    winston.debug("2New Log: %s", JSON.stringify(logs));
    //var rv = processLog(logs);
    //winston.debug("2rv: %s", JSON.stringify(rv))
    //winston.debug("2event: %s:", rv.event)
    //winston.debug("2args : %s:", JSON.stringify(rv.args))
    winston.debug("2=============================\n\n\n")
  }
});

function processLog(logs){
  var rv = logParser(logs, ssAbi);
  return rv;
}

// XXX move this to a hook function
const SolidityEvent = require("web3/lib/web3/event.js");

function logParser(log, abi) {

  // pattern similar to lib/web3/contract.js:  addEventsToContract()
  var decoders = abi.filter(function (json) {
    return json.type === 'event';
  }).map(function (json) {
    // note first and third params required only by enocde and execute;
    // so don't call those!
    return new SolidityEvent(null, json, null);
  }); //ss

    return decoders.find(function (decoder) {
      return (decoder.signature() == log.topics[0].replace("0x", ""));
    }).decode(log);
  
}

// function processTransaction(txHash) {
//   winston.debug('processTransaction %s', txHash)
//   return new Promise((resolve, reject) => {
//     winston.debug(`Processing transaction ${txHash}`);
//     var receipt = web3.eth.getTransactionReceipt(txHash);
//     if (receipt != null) {
//       //winston.debug('txReceipt:', receipt);

//       // TODO: figure out the event read
//       winston.debug('doing the log read')
//       var tx = web3.eth.getTransaction(txHash);
//       winston.debug('TX: ', tx);
//       var evt = logRead(tx, eventName, ssAbi);//.then(function(r){
//       var decoded = logParser()
//       //   console.log(r);
//       // });
//       winston.debug('the event: %s', evt)
//       winston.debug('end of logread')
//       // TODO: end

//       //If specified, this is a new contract deployment, otherwise, it is a contract update
//       var contractAddress;
//       var isUpdate = true;

//       if (receipt.contractAddress) {
//         contractAddress = receipt.contractAddress;
//         winston.info(`Contract deployed at address ${contractAddress.toString('hex')}`);
//         isUpdate = false;
//       } else {
//         contractAddress = receipt.to;
//         winston.info(`Contract updated at address ${contractAddress.toString('hex')}`);
//         isUpdate = true;
//       }
//     }

//   });
// }


// function cacheBlockInfo(blockNumber, blockHash) {
//   return new Promise(function (resolve, reject) {
//     //TODO: Save this information locally or in db
//     winston.info('Block: ' + blockNumber.toString() + ', ' + blockHash.toString());
//     resolve();
//   });
// }

// function queueBlock(block) {
//   winston.debug('queue block')
//   var txCount = block.transactions.length;
//   for (var i = 0; i < txCount; i++) {
//     var tx = block.transactions[i];
//     queueTransaction(block, tx.hash);
//   }
//   winston.debug('done queue block')
// }

// function processQueue() {
//   winston.debug('processQueue...')
//   if (queue) {
//     winston.debug('calling processWorkItem')
//     processWorkItem(queue.shift());
//   }
//   winston.debug('processQueue done...')
// }



// function processWorkItem(workItem) {
//   winston.debug('processWorkItem')
//   if (workItem === undefined) {
//     winston.debug('processWorkItem - no workItem ')
//     return;
//   }

//   winston.debug('calling processTransaction')
//   processTransaction(workItem.txHash).then(function (result) {
//     winston.debug(`Transaction ${workItem.txHash} processed successfully.`);
//     processWorkItem(queue.shift());
//   }, function (err) {
//     winston.error(err);
//     var next = queue.shift();
//     queue.push(workItem);
//     processWorkItem(next);
//   });
// }

// function queueTransaction(block, txHash) {
//   var workItem = {
//     block: block,
//     txHash: txHash
//   }

//   if (queue === undefined) {
//     queue = [workItem];
//   } else {
//     queue.push(workItem);
//   }
// }


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