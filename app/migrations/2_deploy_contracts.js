var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var Nested = artifacts.require("./Nested.sol");

module.exports = function(deployer) {
  deployer.then(function() {
    var newS = SimpleStorage.new(10);
    console.log('newS: %s', newS);
    return newS;
  }).then(function(instance){
    console.log('Instance: %s', JSON.stringify(instance));
    //var newN = Nested.new()
    //return deploy(Nested );
    return;
  })
  // deployer.deploy(SimpleStorage);
  // deployer.deploy(Nested);
};
