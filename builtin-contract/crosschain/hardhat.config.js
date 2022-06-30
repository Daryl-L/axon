const { task } = require("hardhat/config");

require("@nomiclabs/hardhat-waffle");
// const {abi} = require('./artifacts/contracts/crosschain.sol/CrossChain.json');
require('fs');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task('deployTestToken', 'deploy test token on axon').addParam('private').setAction(async (taskArgs, hre) => {
  const signer = new hre.ethers.Wallet(taskArgs.private, hre.ethers.provider);
  const TestToken = await hre.ethers.getContractFactory('TestToken');
  let unsignedTx = await TestToken.getDeployTransaction();
  unsignedTx = await signer.populateTransaction(unsignedTx);
  unsignedTx.nonce = await signer.getTransactionCount() + 1;
  const signedTx = await signer.signTransaction(unsignedTx);
  const tx = await hre.ethers.provider.sendTransaction(signedTx);
  const receipt = await tx.wait();
  console.log(receipt);
});

task('crossAt', 'cross at').addParam('to').addParam('private').setAction(async (taskArgs, hre) => {
  const abi = new hre.ethers.utils.Interface(require('./artifacts/contracts/crosschain.sol/CrossChain.json').abi);
  const signer =new hre.ethers.Wallet(taskArgs.private, hre.ethers.provider);
  let unsignedTx = {
    data: abi.encodeFunctionData('lockAT', [taskArgs.to]),
    to: '0xF67Bc4E50d1df92b0E4C61794A4517AF6a995CB2',
    value: hre.ethers.utils.parseEther('0.1'),
  };
  unsignedTx = await signer.populateTransaction(unsignedTx);
  unsignedTx.nonce = await signer.getTransactionCount() + 1;
  const signedTx = await signer.signTransaction(unsignedTx);
  const tx = await hre.ethers.provider.sendTransaction(signedTx);
  const receipt = await tx.wait();
  console.log(receipt);
});

task('crossToken', 'cross token').addParam('to').addParam('token').addParam('amount').addParam('private').setAction(async (taskArgs, hre) => {
  const abi = new hre.ethers.utils.Interface(require('./artifacts/contracts/crosschain.sol/CrossChain.json').abi);
  const signer =new hre.ethers.Wallet(taskArgs.private, hre.ethers.provider);
  let unsignedTx = {
    data: abi.encodeFunctionData('crossTokenToCKB', [taskArgs.to, taskArgs.token, hre.ethers.utils.parseUnits(taskArgs.amount, 18)]),
    to: '0xF67Bc4E50d1df92b0E4C61794A4517AF6a995CB2',
  };
  unsignedTx = await signer.populateTransaction(unsignedTx);
  unsignedTx.nonce = await signer.getTransactionCount() + 1;
  const signedTx = await signer.signTransaction(unsignedTx);
  const tx = await hre.ethers.provider.sendTransaction(signedTx);
  const receipt = await tx.wait();
  console.log(receipt);
});

task('checkTxHash').addParam('hash').setAction(async (args, hre) => {
  console.log('check tx hash:', args.hash);
  console.log(await hre.ethers.provider.getTransaction(args.hash));
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    axon: {
      url: 'http://13.113.146.156:8000',
      accounts: [],
    },
    axon_native: {
      url: 'http://127.0.0.1:8000',
      accounts: [],
    },
  },
};
