var Election = artifacts.require('./Election.sol');

contract('Election', function (accounts) {

  it('Kontrat oluştuğunda aday olmamalı', function () {
    return Election.deployed().then(function (instance) {
      return instance.candidatesCount();
    }).then(function (count) {
      assert.equal(count, 0);
    });
  });

  it('0.5ETH ödemesi yapılmadan aday olunamamalı', function () {
    return Election.deployed().then(function (instance) {
      return instance.becomeCandidate('RTE', 'QmaBbeYSQ92HWERuKcmRp9wWzr2C8LjJQwnvmf8LuviJAY', { value: 200 });
    }).then(assert.fail).catch(function (error) {
      assert(error.message.indexOf('revert') >= 0, "Hata mesajının içinde 'revert' olmalı");
    });
  });

  it('0.5ETH ödemesi durumunda aday olunabilmeli', function () {
    return Election.deployed().then(function (instance) {
      electionInstance = instance;
      return instance.becomeCandidate('RTE', 'QmaBbeYSQ92HWERuKcmRp9wWzr2C8LjJQwnvmf8LuviJAY', { value: 1000000000000000000 });
    }).then(function (balance) {
      return electionInstance.candidatesCount();
    }).then(function (count) {
      assert.equal(count, 1);
      return web3.eth.getBalance(electionInstance.address)
    }).then(function (balance) {
      assert.equal(balance, 1000000000000000000);
    });
  });

  it('Bir aday bir daha aday olamamalı', function () {
    return Election.deployed().then(function (instance) {
      return instance.becomeCandidate('RTE', 'QmaBbeYSQ92HWERuKcmRp9wWzr2C8LjJQwnvmf8LuviJAY', { value: 1000000000000000000 });
    }).then(assert.fail).catch(function (error) {
      assert(error.message.indexOf('revert') >= 0, "Hata mesajının içinde 'revert' olmalı");
    });
  });

  it('Seçmen oy verebilmeli', function () {
    return Election.deployed().then(function (instance) {
      electionInstance = instance;
      return electionInstance.vote(accounts[1]);
    }).then(function (receipt) {
      assert.equal(receipt.logs.length, 1, '1 olay tetiklendi');
      assert.equal(receipt.logs[0].event, 'votedEvent', 'Tetiklenen olayın ismi doğrulandı');
      assert.equal(receipt.logs[0].args._candidateId, accounts[1], 'Adayın adresi doğrulandı');
      return electionInstance.voters(accounts[1]);
    }).then(function (voted) {
      assert(voted, 'Seçmen oy verdi olarak işaretlendi');
      return electionInstance.candidates(accounts[1]);
    }).then(function (candidate) {
      assert.equal(candidate[3], 1, 'Adayın oyu 1 oldu');
    });
  });

  it('Seçmen oy kullanmış ise bir daha oy verememeli', function () {
    return Election.deployed().then(function (instance) {
      electionInstance = instance;
      return electionInstance.vote(accounts[0]);
    }).then(assert.fail).catch(function (error) {
      assert(error.message.indexOf('revert') >= 0, "Hata mesajının içinde 'revert' olmalı");
    });
  });

  it('RTE seçimi kazanmalı', function () {
    return Election.deployed().then(function (instance) {
      electionInstance = instance;
      return electionInstance.finish();
    }).then(function (receipt) {
      assert.equal(receipt.logs.length, 1, "1 olay tetiklendi");
      assert.equal(receipt.logs[0].event, "winnerEvent", "Tetiklenen olayın ismi doğrulandı");
      assert.equal(receipt.logs[0].args._candidateName, "RTE", "Kazanan adayın ismi doğrulandı");
      assert.equal(receipt.logs[0].args._candidateVoteCount, 1, "Kazanan adayın topladığı oy sayısı doğrulandı");

      return web3.eth.getBalance(electionInstance.address);
    }).then(function (balance) {
      assert.equal(balance, 0);
    });
  });

  it('Seçim bittiğinde oy kullanılamamalı', function () {
    return Election.deployed().then(function (instance) {
      electionInstance = instance;
      return electionInstance.vote(accounts[5]);
    }).then(assert.fail).catch(function (error) {
      assert(error.message.indexOf('revert') >= 0, "Hata mesajının içinde 'revert' olmalı");

      return electionInstance.isFinished();
    }).then(function (isFinished) {
      assert(isFinished, "Seçim sonlanmış olmalı");
    });
  });
});