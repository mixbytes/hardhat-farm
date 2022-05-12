pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract TokenFactory {
    FactoryToken[] public factoryTokenAddresses;
    event FactoryTokenCreated(FactoryToken factoryToken);

    address private factoryTokenOwner;
    uint256 public interactions = 0;

    constructor() {
        factoryTokenOwner = msg.sender;
    }

    function mintOneTokenForFactory(address token) external {
        FactoryToken(token).mint(address(this), 1);
    }

    function createFactoryToken(uint256 initialBalance) external payable {
        FactoryToken factoryToken = new FactoryToken(initialBalance);
        factoryTokenAddresses.push(factoryToken);
        emit FactoryTokenCreated(factoryToken);
    }

    function create2FactoryToken(uint256 initialBalance) external payable {
        FactoryToken factoryToken = (new FactoryToken){salt: "aaaaa"}(initialBalance);
        factoryTokenAddresses.push(factoryToken);
        emit FactoryTokenCreated(factoryToken);
    }

    function createDummy() external {
        new Dummy();
    }
    
    function createDummyPayable() external payable {
        new Dummy();
    }

    function getFactoryTokens() external view returns (FactoryToken[] memory) {
        return factoryTokenAddresses;
    }
}

contract Dummy {
    uint256 public dummy;

    constructor() {
        dummy = 1;
    }
}


contract FactoryToken {
    string public name = "FactoryToken";
    string public symbol = "FCT";

    uint256 public totalSupply = 0;
    mapping(address => uint256) balances;
    
    address public owner;

    bool private initialized = false;

    constructor(uint256 _initialBalance) {
        owner = msg.sender;
        totalSupply = _initialBalance;
        balances[owner] = _initialBalance;
    }

    function destroy() public {
        selfdestruct(payable(msg.sender));
    }

    function transfer(address to, uint256 amount) external {
        require(balances[msg.sender] >= amount, "Not enough tokens");
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }

    function mint(address user, uint256 amount) external {
        // require(msg.sender == owner, "Access denied");
        balances[user] += amount;
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
}

/*
contract Create2Deployer {
  event Deployed(address addr, uint256 salt);

  function deploy(bytes memory code, uint256 salt) public {
    address addr;
    assembly {
      addr := create2(0, add(code, 0x20), mload(code), salt)
      if iszero(extcodesize(addr)) {
        revert(0, 0)
      }
    }

    emit Deployed(addr, salt);
  }
}
*/


