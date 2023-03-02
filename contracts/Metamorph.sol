//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;

// We import this library to be able to use console.log
import "hardhat/console.sol";

contract MetaDeployer {
    event MutDeployerDeployed(address _addr);

    function createMutDeployer() public {
        // using CREATE2
        MutDeployer d = (new MutDeployer){salt: "123456"}();
        emit MutDeployerDeployed(address(d));
    }
}

contract MutDeployer {
    event MutDeployed(address _addr);

    function deploy_v1() public {
        MutableV1 mt = new MutableV1(); // using CREATE
        emit MutDeployed(address(mt));
    }

    function deploy_v2() public {
        MutableV2 mt = new MutableV2(); // using CREATE
        emit MutDeployed(address(mt));
    }

    function destroy() public {
        selfdestruct(payable(address(msg.sender)));
    }
}

contract MutableV1 {
    uint256 public balance = 1000000;
    function destroy() public {
        selfdestruct(payable(address(msg.sender)));
    }
}

contract MutableV2 {
    uint256 public balance = 999999;
    function destroy() public {
        selfdestruct(payable(address(msg.sender)));
    }
}



