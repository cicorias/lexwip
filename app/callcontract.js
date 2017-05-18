#!/usr/bin/env node

const my_artifact = require('./build/contracts/SimpleStorage.json');
const contract = require('truffle-contract');
const SimpleStorage = contract(my_artifact);

// const host = 'http://13.64.236.113:8545'
const host = 'http://localhost:8545'
const Web3 = require('web3')
const HttpHeaderProvider = require('httpheaderprovider');
const provider = new Web3.providers.HttpProvider(host)
const web3 = new Web3(provider);

SimpleStorage.setProvider(web3.currentProvider);

var accounts = web3.eth.accounts;
var account = accounts[0];

var meta;
SimpleStorage.deployed().then(function (instance) {
  meta = instance;
  return meta.set(22, { from: account });
}).then(function () {
  console.log("Transaction complete!");

}).catch(function (e) {
  console.error('trapped')
  console.error(e);

});