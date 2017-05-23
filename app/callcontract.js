#!/usr/bin/env node

const simplestorage_json = require('./build/contracts/SimpleStorage.json');
const nested_json = require('./build/contracts/Nested.json')
const contract = require('truffle-contract');
const SimpleStorage = contract(simplestorage_json);
const Nested = contract(nested_json);

const host = 'http://localhost:8545'
const Web3 = require('web3')
const HttpHeaderProvider = require('httpheaderprovider');
const provider = new Web3.providers.HttpProvider(host)
const web3 = new Web3(provider);

SimpleStorage.setProvider(web3.currentProvider);
Nested.setProvider(web3.currentProvider);

var accounts = web3.eth.accounts;
var account = accounts[0];

var storage;

SimpleStorage.defaults({
   from: account, 
    gas: 4712388,
    gasPrice: 300000000000
});



SimpleStorage.new(1).then(function (instance) {
  storage = instance;
  console.log('contract address: %s', instance.address);
  return storage.set(42);
}).then(function (s) {
  console.log("s: %s", JSON.stringify(s))
  return storage.getNested1.call();
}).then(function(result){
  Nested.at(result).then(function(instance){
    console.log('Nested addrr: %s', result);
    return instance.getState.call();
  }).then(function(val){
    console.log("value at getState1: %s", val);
  })
}).catch(function (e) {
  console.error('trapped')
  console.error(e);
});


// })
//   var rv = instance.call.getNested1()
//   console.log("rv: %s", JSON.stringify(rv))
//   console.log("Transaction complete!");
