module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*', // Match any network id
      from : '0x8c1169C85Ee8bDC0621C3b52cfD1b0ef1805F033'
    }
  }
};
