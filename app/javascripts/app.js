// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import metacoin_artifacts from '../../build/contracts/HumanStandardToken.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var MetaCoin = contract(metacoin_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var mainAccount;
var userAccount;
var metaContract;
var eth_price;

window.App = {
    start: function() {
        var self = this;

        // Bootstrap the MetaCoin abstraction for Use.
        MetaCoin.setProvider(web3.currentProvider);
        // Get the initial account balance so it can be displayed.
        web3.eth.getAccounts(function (err, accs) {
            if (err != null) {
                alert("There was an error fetching your accounts.");
                return;
            }

            if (accs.length == 0) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }

            accounts = accs;
            mainAccount = accounts[0];
            userAccount = accounts[1];
            MetaCoin.deployed().then(function (instance) {
                metaContract = instance;
                self.refreshBalance();
            });
        });
    },
    setStatus: function(message) {
        var status = document.getElementById("status");
        status.innerHTML = message;
    },
    refreshBalance: function() {
        var self = this;
        //更新主帐户代币
        metaContract.balanceOf.call(mainAccount, {from: userAccount}).then(function(value) {
            var balance_element = document.getElementById("coin_owner");
            balance_element.innerHTML = value.valueOf();
        }).catch(function(e) {
            console.log(e);
            self.setStatus("Error getting main account balance; see log.");
        });
        //更新合约帐户代币
        metaContract.getCrowdFundRest.call({from: userAccount}).then(function(value) {
            var balance_element = document.getElementById("coin_crowd");
            balance_element.innerHTML = value.valueOf();
        }).catch(function(e) {
            console.log(e);
            self.setStatus("Error getting crowdfund account balance; see log.");
        });
        //更新用户代币
        metaContract.balanceOf.call(userAccount, {from: userAccount}).then(function(value) {
            var balance_element = document.getElementById("coin_user");
            balance_element.innerHTML = value.valueOf();
        }).catch(function(e) {
            console.log(e);
            self.setStatus("Error getting user account balance; see log.");
        });
        //更新合约以太币

        var eth_value=web3.eth.getBalance(metaContract.address);
        var eth_show=web3.fromWei(eth_value,'finney');
        var eth_element = document.getElementById("crowd_eth");
        eth_element.innerHTML = eth_show.valueOf();
    },
    sendCoin: function() {
        var self = this;

        var amount = parseInt(document.getElementById("amount").value);
        var receiver = document.getElementById("receiver").value;

        this.setStatus("Initiating transaction... (please wait)");

        var meta;
        MetaCoin.deployed().then(function(instance) {
            meta = instance;
            return meta.transfer(receiver, amount, {from: userAccount});
        }).then(function() {
            self.setStatus("Transaction complete!");
            self.refreshBalance();
        }).catch(function(e) {
            console.log(e);
            self.setStatus("Error sending coin; see log.");
        });
    },
    startCrowdFund:function(){
        var self=this;
        var token_value=parseInt(document.getElementById("crowdFund_amount").value);
        var token_price=parseInt(document.getElementById("crowdFund_price").value);
        eth_price=token_price;
        metaContract.startCrowdFund.sendTransaction(token_value,token_price, {from: mainAccount}).then(function(value) {
            self.setStatus("Start crowdFund complete!");
            self.refreshBalance();
        }).catch(function(e) {
            console.log(e);
            self.setStatus("Start crowdFund error; see log.");
        });
    },
    stopCrowdFund:function(){
        var self=this;

        metaContract.stopCrowdFund.sendTransaction( {from: mainAccount}).then(function(value) {
            self.setStatus("Stop crowdFund complete!");
            self.refreshBalance();
        }).catch(function(e) {
            console.log(e);
            self.setStatus("Stop crowdFund error; see log.");
        });
    },
    buyCoin:function(){
        var self=this;
        var eth_value=parseInt(document.getElementById("eth_amount").value);
        var eth_wei=eth_value*eth_price;
        //var eth_wei=web3.toWei(eth_value,'finney');

        //使用众筹合约购币
        metaContract.buyCoin({from:userAccount,value:eth_wei}).then(function() {
            self.setStatus("CrowdFund: buy coin complete!");
            self.refreshBalance();
        }).catch(function(e) {
            console.log(e);
            self.setStatus("CrowdFund: buy coin error; see log.");
        });
    }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  }

  App.start();
});
