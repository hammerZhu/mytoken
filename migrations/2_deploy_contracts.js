
var Token=artifacts.require("./Token.sol");
var StandardToken=artifacts.require("./StandardToken.sol");
var HumanToken=artifacts.require("./HumanStandardToken.sol");

module.exports = function(deployer) {
    deployer.deploy(HumanToken,100000,"KEE_COIN",2,"$",20000,20000,100000000000000);
    //var  tokenAddress=HumanToken.address;
    //console.log(tokenAddress);
    //deployer.deploy(CrowdFund,100000,1000000000000000,tokenAddress);
};
