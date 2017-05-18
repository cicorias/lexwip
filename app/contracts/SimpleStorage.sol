pragma solidity ^0.4.2;

contract SimpleStorage {
    event newContract( string  contractType);
    event updateContract( string contractType);

    uint storedData;

    function SimpleStorage(uint initialValue){
      newContract("SimpleStorage");
      storedData = initialValue;
    }

    function set(uint x) {
        updateContract("SimpleStorage");
        storedData = x;
    }

    function get() constant returns (uint) {
        return storedData;
    }
}
