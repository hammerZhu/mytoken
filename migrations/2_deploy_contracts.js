
var Token=artifacts.require("./Token.sol");
var StandardToken=artifacts.require("./StandardToken.sol");
var HumanToken=artifacts.require("./HumanStandardToken.sol");
var CrowdFund=artifacts.require("./crowdFund.sol");

module.exports = function(deployer) {
    deployer.deploy(HumanToken,1000000,100000,"KEE_COIN",2,"$");
    //var  tokenAddress=HumanToken.address;
    //console.log(tokenAddress);
    //deployer.deploy(CrowdFund,100000,1000000000000000,tokenAddress);
};
