App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Election.json", function (election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function () {
    App.contracts.Election.deployed().then(function (instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function (error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        //App.render();
      });
    });
  },

  render: function () {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").append(account);

        web3.eth.getBalance(App.account, web3.eth.defaultBlock, (err, val) => {
          //var wei = web3.fromWei(val).toNumber();
          var balance = val.toNumber();
          console.log(balance);

          if (balance < 500000000000000000) {
            console.log("Bakiye yetersiz");
          }
        });
      }
    });

    // Load contract data
    App.contracts.Election.deployed().then(function (instance) {
      electionInstance = instance;
      return electionInstance.voters(App.account);
    }).then(function (voter) {
      voted = voter;
      return electionInstance.candidatesCount();
    }).then(function (candidatesCount) {

      $("#candidates").empty();

      for (var i = 0; i < candidatesCount; i++) {
        electionInstance.candidateAddress(i).then(function (adr) {

          electionInstance.candidates(adr).then(function (candidate) {
            var data = Handlebars.templates.candidates({
              candidate: {
                id: candidate[0].toString(),
                name: candidate[1],
                voteCount: candidate[2].toString()
              }
            });

            $("#candidates").append(data);

            if (voted) {
              $('#candidates .btn-vote').attr("disabled", "disabled");
            }
          });
        });
      }

      return electionInstance.voters(App.account);
    }).then(function (hasVoted) {
      loader.hide();
      content.show();
    }).catch(function (error) {
      console.warn(error);
    });
  },

  castVote: function (candidateId) {
    App.contracts.Election.deployed().then(function (instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function (result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function (err) {
      console.error(err);
    });
  },

  registerCandidate: function () {
    var candidateName = $('#candidateName').val();
    console.log(App.account);
    console.log(candidateName);
    App.contracts.Election.deployed().then(function (instance) {
      return instance.becomeCandidate(candidateName, { from: App.account, value: 500000000000000000 });
    }).then(function (result) {
      console.log(result);
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function (err) {
      console.error(err);
    });
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});