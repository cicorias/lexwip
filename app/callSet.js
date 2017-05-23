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

var accounts = web3.eth.accounts;
var account = accounts[0];

SimpleStorage.setProvider(web3.currentProvider);

SimpleStorage.defaults({
   from: account, 
    gas: 4712388,
    gasPrice: 300000000000
});



//0xcd3350784d2978bd29d5fa5625d5cc3f5f006beb
var meta;
SimpleStorage.at('0x26ba76600529feef3282c4848803e0150b4189da').then(function (instance) {
  meta = instance;
  return meta.getNested1.call();
}).then(function(val){
  console.log("getNested1: %s", val);
  return meta.set(99);
}).then(function (result) {
  console.log("Result: %s", JSON.stringify(result))
}).catch(function (e) {
  console.error('trapped')
  console.error(e);

});