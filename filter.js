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

// var filter = web3.eth.filter();
var filter = web3.eth.filter('latest', cb, cb2);


// watch for changes
filter.watch(function (error, result) {
  if (error) {
    console.error("Error: %s", error.message)
    // console.error("Stack: %s", error.stack)
  }
  else {
    console.log("New Block: %s", result);
    var txCount = web3.eth.getBlockTransactionCount(result);
    if (txCount > 0) {
      web3.eth.getBlock(result, true, function (err, res) {
        if (err) {
          winston.error("Error getting block: ", err);
        } else {

          var sync = web3.eth.syncing;
          winston.debug('web3.eth.syncing: ', sync);

          if (sync === true) {
            cacheBlockInfo(res.number, res.hash)
              .then(function () {
                queueBlock(res);
              });
          } else {
            cacheBlockInfo(res.number, res.hash)
              .then(function () {
                queueBlock(res);
                processQueue();
              });
          }
        }
      });
    } else {
      winston.info('no tx, processing queue')
      processQueue();
    }
  }
});

function processWorkItem(workItem) {
  winston.debug('processing workitem')
  if (workItem === undefined) {
    return;
  }

  processTransaction(workItem.txHash).then(function (result) {
    winston.debug(`Transaction ${workItem.txHash} processed successfully.`);
    processWorkItem(queue.shift());
  }, function (err) {
    winston.error(err);
    var next = queue.shift();
    queue.push(workItem);
    processWorkItem(next);
  });
}

function processTransaction(txHash) {
  winston.debug('processTransaction %s', txHash)
  return new Promise((resolve, reject) => {
    winston.debug(`Processing transaction ${txHash}`);
    var receipt = web3.eth.getTransactionReceipt(txHash);
    if (receipt != null) {
      winston.debug('txReceipt:', receipt);

      //If specified, this is a new contract deployment, otherwise, it is a contract update
      var contractAddress;
      var isUpdate = true;

      if (receipt.contractAddress) {
        contractAddress = receipt.contractAddress;
        winston.info(`Contract deployed at address ${contractAddress.toString('hex')}`);
        isUpdate = false;
      } else {
        contractAddress = receipt.to;
        winston.info(`Contract updated at address ${contractAddress.toString('hex')}`);
        isUpdate = true;
      }
    }

  });
}


function cacheBlockInfo(blockNumber, blockHash) {
  return new Promise(function (resolve, reject) {
    //TODO: Save this information locally or in db
    winston.info('Block: ' + blockNumber.toString() + ', ' + blockHash.toString());
    resolve();
  });
}

function queueBlock(block) {
  winston.debug('queue block')
  var txCount = block.transactions.length;
  for (var i = 0; i < txCount; i++) {
    var tx = block.transactions[i];
    queueTransaction(block, tx.hash);
  }
  winston.debug('done queue block')
}

function processQueue() {
  winston.debug('processQueue...')
  if (queue) {
    winston.debug('calling processWorkItem')
    processWorkItem(queue.shift());
  }
  winston.debug('processQueue done...')
}



function processWorkItem(workItem) {
  winston.debug('processWorkItem')
  if (workItem === undefined) {
    winston.debug('processWorkItem - no workItem ')
    return;
  }

  winston.debug('calling processTransaction')
  processTransaction(workItem.txHash).then(function (result) {
    winston.debug(`Transaction ${workItem.txHash} processed successfully.`);
    processWorkItem(queue.shift());
  }, function (err) {
    winston.error(err);
    var next = queue.shift();
    queue.push(workItem);
    processWorkItem(next);
  });
}

function queueTransaction(block, txHash) {
  var workItem = {
    block: block,
    txHash: txHash
  }

  if (queue === undefined) {
    queue = [workItem];
  } else {
    queue.push(workItem);
  }
}


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
