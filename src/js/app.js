App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
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

    $.getJSON('Election.json', (election) => {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenEvents();

      return App.render();
    });
  },

  listenEvents: function () {
    App.contracts.Election.deployed().then((instance) => {

      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch((error, event) => {

        console.log('event triggered', event);

        $("[data-candidate-id='" + event.args._candidateId + "'] .vote-count").html(event.args._candidateVoteCount.toString());

        if (event.args._woterId == App.account) {
          App.disableVoteButton();
        }

        App.hidePreloader();

      });

      instance.registeredCandidateEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch((error, event) => {

        console.log('event triggered', event);

        App.addCandidateItem({
          id: event.args._candidateId.toString(),
          name: event.args._candidateName,
          photoHash : event.args._candidatePhotoHash,
          voteCount: event.args._candidateVoteCount.toString()
        });

        if (event.args._candidateId == App.account) {
          App.hideRegisterCandidateForm();
        }

        App.hidePreloader();

      });

      instance.winnerEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch((error, event) => {

        console.log('event triggered', event);

        var candidateRow = $("[data-candidate-id='" + event.args._candidateId + "']");
        candidateRow.addClass('success');
        candidateRow.find('.candidate-name').append(' <span class="label label-success">Kazandı!</span>');

        App.disableFinishButton();
        App.hidePreloader();

      });
    });
  },

  render: function () {
    App.showPreloader();

    web3.eth.getCoinbase((err, account) => {

      if (err === null) {
        App.account = account;
        $('#accountAddress').append(account);

        web3.eth.getBalance(App.account, web3.eth.defaultBlock, (err, val) => {
          var balance = val.toNumber();

          if (balance < 1000000000000000000) {
            $('#insufficientBalance').show();
            $('#registerCandidateForm').hide();
          }
          else {
            $('#insufficientBalance').hide();
            $('#registerCandidateForm').show();
          }
        });
      }

    });

    App.contracts.Election.deployed().then((instance) => {

      console.log('instance', instance);
      $('#contractAddress').append(instance.address);

      electionInstance = instance;

      return electionInstance.owner();

    }).then((owner) => {

      console.log('owner', owner);

      if (owner == App.account) {
        $('#btnFinish').removeClass('hidden');
      }

      return electionInstance.voters(App.account);

    }).then((voter) => {

      console.log('voter', voter);

      voted = voter;
      return electionInstance.isFinished()

    }).then((isFinished) => {

      console.log('isFinished', isFinished);

      if (isFinished) {
        App.disableFinishButton();
      }

      finished = isFinished;

      return electionInstance.winnerCandidate();

    }).then((winnerCandidate) => {

      console.log('winnerCandidate', winnerCandidate);

      winner = winnerCandidate.toString();

      return electionInstance.candidatesCount();

    }).then((candidatesCount) => {

      console.log('candidatesCount', candidatesCount.toNumber());

      $('#candidates').empty();

      for (var i = 0; i < candidatesCount; i++) {
        electionInstance.candidateAddress(i).then((address) => {

          electionInstance.candidates(address).then((candidate) => {

            App.addCandidateItem({
              id: candidate[0].toString(),
              name: candidate[1],
              photoHash: candidate[2],
              voteCount: candidate[3].toString(),
              isWinner: candidate[0].toString() == winner
            });

            if (voted || finished) {
              App.disableVoteButton();
            }

            if (App.account == candidate[0] || finished) {
              App.hideRegisterCandidateForm();
            }

          });

        });
      }
    }).then(() => {

      App.hidePreloader();

    }).catch((error) => {
      console.error(error);
    });
  },

  registerCandidate: function () {
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('buffer', reader.result);

      const ipfs = window.IpfsApi({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
      //const ipfs = window.IpfsApi('localhost', '5001');
      
      ipfs.files.add(buffer.Buffer(reader.result), (error, result) => {

        console.log('ipfs error', error);
        console.log('ipfs hash', result[0]);
        console.log('ipfs url', 'https://ipfs.io/ipfs/' + result[0].hash);
        
        var candidateItem = App.getCandidateItem();

        App.contracts.Election.deployed().then((instance) => {

          return instance.becomeCandidate(candidateItem.candidateName, result[0].hash, { from: App.account, value: 1000000000000000000 });

        }).then(() => {

          App.showPreloader();

        }).catch((err) => {
          console.error(err);
        });
      });
    };

    const photo = document.getElementById("photo");
    reader.readAsArrayBuffer(photo.files[0]);
  },

  castVote: function (candidateId) {
    App.contracts.Election.deployed().then((instance) => {

      return instance.vote(candidateId, { from: App.account });

    }).then(() => {

      App.showPreloader();

    }).catch((error) => {
      console.error(error);
    });
  },

  finish: function () {
    App.contracts.Election.deployed().then((instance) => {

      return instance.finish();

    }).then(() => {

      App.showPreloader();

    }).catch((error) => {
      console.error(error);
    });
  },

  getCandidateItem: function () {
    return {
      candidateName: $('#candidateName').val()
    };
  },

  addCandidateItem: function (candidate) {
    var candidateItemHtml = Handlebars.templates.candidates({
      candidate: {
        id: candidate.id,
        name: candidate.name,
        photoHash : candidate.photoHash,
        voteCount: candidate.voteCount,
        isWinner: candidate.isWinner
      }
    });

    $('#candidates').append(candidateItemHtml);
  },

  hidePreloader: function () {
    $('#content').show();
    $('#loader').hide();
  },

  showPreloader: function () {
    $('#content').hide();
    $('#loader').show();
  },

  hideRegisterCandidateForm: function () {
    $('#registerCandidateForm input, #registerCandidateForm button').attr('disabled', 'disabled');
  },

  disableVoteButton: function () {
    $('#candidates .btn-vote').attr('disabled', 'disabled');
  },

  disableFinishButton: function () {
    $('#btnFinish').attr('disabled', 'disabled');
  }
};

$(function () {
  App.init();
});