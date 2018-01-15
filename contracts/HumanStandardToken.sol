/*
This Token Contract implements the standard token functionality (https://github.com/ethereum/EIPs/issues/20) as well as the following OPTIONAL extras intended for use by humans.

In other words. This is intended for deployment in something like a Token Factory or Mist wallet, and then used by humans.
Imagine coins, currencies, shares, voting weight, etc.
Machine-based, rapid creation of many tokens would not necessarily need these extra features or will be minted in other manners.

1) Initial Finite Supply (upon creation one specifies how much is minted).
2) In the absence of a token registry: Optional Decimal, Symbol & Name.
3) Optional approveAndCall() functionality to notify a contract if an approval() has occurred.

.*/

import "./StandardToken.sol";

pragma solidity ^0.4.8;

contract HumanStandardToken is StandardToken {

    /* Public variables of the token */
    event BuyCoinEvent(address indexed _to, uint256 _value);
    event CrowdFundCoinEvent(address _to, uint256 _value);
    /*
    NOTE:
    The following variables are OPTIONAL vanities. One does not have to include them.
    They allow one to customise the token contract & in no way influences the core functionality.
    Some wallets/interfaces might not even bother to look at this information.
    */
    string public name;                   //fancy name: eg Simon Bucks
    uint8 public decimals;                //How many decimals to show. ie. There could 1000 base units with 3 decimals. Meaning 0.980 SBX = 980 base units. It's like comparing 1 wei to 1 ether.
    string public symbol;                 //An identifier: eg SBX
    string public version = 'H0.1';       //human 0.1 standard. Just an arbitrary versioning scheme.
    address _owner;

    uint256 circulation;
    uint crowdfundRestNum;// the coins of this crowdfund,if its 0 ,there are no crowdfund.
    uint256 pricePerCoin;//num of wei  for a coin
    uint256 ethRaise;

     function HumanStandardToken(
        uint256 _totalAmount,
        uint256 _initialAmount,
        string _tokenName,
        uint8 _decimalUnits,
        string _tokenSymbol
        ) public {
        require(_initialAmount<=_totalAmount);
        _owner=msg.sender;
        totalSupply = _totalAmount;                          // Update total supply
        balances[msg.sender] = _initialAmount;               // Give the creator all initial tokens
        circulation=_initialAmount;
        name = _tokenName;                                   // Set the name for display purposes
        decimals = _decimalUnits;                            // Amount of decimals for display purposes
        symbol = _tokenSymbol;                               // Set the symbol for display purposes

        crowdfundRestNum=0;
        pricePerCoin=100000000000000;
        ethRaise=0;
    }

    /* Approves and then calls the receiving contract */
    function approveAndCall(address _spender, uint256 _value, bytes _extraData) public returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);

        //call the receiveApproval function on the contract you want to be notified. This crafts the function signature manually so one doesn't have to include a contract in here just for this.
        //receiveApproval(address _from, uint256 _value, address _tokenContract, bytes _extraData)
        //it is assumed when one does this that the call *should* succeed, otherwise one would use vanilla approve instead.
        require(_spender.call(bytes4(bytes32(keccak256("receiveApproval(address,uint256,address,bytes)"))), msg.sender, _value, this, _extraData));
        return true;
    }

    //crowdfund coins
    function startCrowdFund(uint amount,uint256 price){
        require(msg.sender==_owner);
        require(crowdfundRestNum==0);
        require(circulation+amount<=totalSupply);
        totalSupply += amount;
        crowdfundRestNum=amount;
        pricePerCoin=price;
        ethRaise=0;
        CrowdFundCoinEvent(msg.sender,amount);
    }
    function stopCrowdFund(){
        require(msg.sender==_owner);
        // get eth
        _owner.transfer(ethRaise);
        //get rest coins
        balances[msg.sender]+=crowdfundRestNum;
        crowdfundRestNum=0;
    }
    function getCrowdFundRest() returns (uint256){
        return crowdfundRestNum;
    }
    function crowdFundAvail() returns (bool){
        if(crowdfundRestNum>0)
            return true;
        else
            return false;
    }
    function buyCoin() payable {
        uint tokenNum=msg.value/pricePerCoin;
        require(crowdfundRestNum>=tokenNum);
        crowdfundRestNum -=tokenNum;
        balances[msg.sender] += tokenNum;
        ethRaise+=msg.value;
        BuyCoinEvent(msg.sender,tokenNum);
    }
}
