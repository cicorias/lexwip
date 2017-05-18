pragma solidity ^0.4.3;

contract SimpleStorage {
    event updateContract(string contractType);

    uint256 storedData;

    function SimpleStorage(uint256 initialValue){
      updateContract("SimpleStorage");
      storedData = initialValue;
    }

    function set(uint256 x) {
        updateContract("SimpleStorage");
        storedData = x;
    }

    function get() constant returns (uint256) {
        return storedData;
    }
}
