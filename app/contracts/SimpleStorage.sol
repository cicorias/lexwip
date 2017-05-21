pragma solidity ^0.4.3;

contract Nested {
  
  event updateContract(string contractType);
  uint256 mirroredState;
  address owner;
  address parentContract;  

  function Nested(address p, address o) {
    owner = o;
    mirroredState = 0;
    parentContract = p;
    updateContract("NestedConstructor");
  }

  function changeState(uint256 newState) {
      mirroredState = newState;
      updateContract("NestedFunction");
  }

  function getState() constant returns (uint256) {
    return mirroredState;
  }
  
}

contract SimpleStorage {
    event updateContract(string contractType);
    
    Nested nestedState;
    Nested nestedState2;
    uint256 storedData;

    function SimpleStorage(uint256 initialValue){
      nestedState = new Nested(this, msg.sender);
      nestedState.changeState(20);
      storedData = initialValue;
      updateContract("SimpleStorageConstructor");
    }

    function set(uint256 x) {
        updateContract("SimpleStorageFunction1");
        nestedState.changeState(x);
        storedData = x;
        updateContract("SimpleStorageFunction2");
        nestedState2 = new Nested(this, msg.sender);
        updateContract("SimpleStorageFunction3");
    }

    function get() constant returns (uint256) {
        return storedData;
    }

    function getNested1() constant returns (address) {
        return nestedState;
    }

    function getNested2() constant returns (address) {
        return nestedState2;
    }

}
