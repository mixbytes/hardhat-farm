pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Proxy {

    address public impl;
    uint256 public version = 3;

    constructor(address _implementation) {
        impl = _implementation;
    }
    
   
    fallback() external {
        address i = impl;
        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.
            let result := delegatecall(gas(), i, 0, calldatasize(), 0, 0)

            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())

            switch result
            // delegatecall returns 0 on error.
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
    

    function ___clash550254402() public {
        version = version + 1;
    }
 
}


contract EvilToken {
    string public name = "EvilToken";
    string public symbol = "EVT";

    uint256 public totalSupply = 0;
    mapping(address => uint256) balances;
    
    address public owner;

    bool private initialized = false;

    constructor() {
        owner = msg.sender;
        totalSupply = 100;
        balances[owner] = totalSupply;
        console.log("Constructor is called, owner %s has %s tokens", owner, balances[owner]);
    }

    function transfer(address to, uint256 amount) external {
        require(balances[msg.sender] >= amount, "Not enough tokens");
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }

    function mint(address user, uint256 amount) external {
        require(msg.sender == owner, "Access denied");
        balances[user] += amount;
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }


    function init() public {
        require(initialized == false, "init can be run only once");
        initialized = true;

        owner = msg.sender;
        totalSupply = 100;
        balances[owner] = totalSupply;

        console.log("Init is called, owner %s has %s tokens", owner, balances[owner]);
    }
    

    function proxyOwner() public {
        require(msg.sender == owner, "Access denied");
        balances[owner] += 666;
    }



}
