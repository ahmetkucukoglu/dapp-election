module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*',
      from : '0x72087565F9B02271f5418c737687d5a42e1B4B29'
    },
    rinkeby: {
      host: '127.0.0.1',
      port: 8545,
      network_id: 4,
      gas: 4700000
    }
  }
};
