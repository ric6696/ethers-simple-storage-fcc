const { Web3 } = require("web3");
const fs = require("fs-extra");
require("dotenv").config();

async function main() {
  // HTTP://127.0.0.1:7545
  const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL));
  const account = web3.eth.accounts.privateKeyToAccount(
    process.env.PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(account.privateKey);
  //   console.log("Account: ", accounts.address);

  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.json", "utf8");
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf8"
  );

  const myContract = new web3.eth.Contract(JSON.parse(abi));

  console.log("Deploying the contract..., please wait");

  const contract = await myContract
    .deploy({
      data: "0x" + binary,
    })
    .send({
      from: account.address,
      gas: 1000000, // Lower gas limit
      gasPrice: await web3.eth.getGasPrice(),
    });

  let currentFavoriteNumber = await contract.methods.retrieve().call();
  console.log(`Current Favorite Number: ${currentFavoriteNumber}`);

  let transactionResponse = await contract.methods.store("9").send({
    from: account.address,
    gas: 1000000,
    gasPrice: await web3.eth.getGasPrice(),
  });

  let transactionReceipt = await web3.eth.getTransactionReceipt(
    transactionResponse.transactionHash
  );
  let updatedFavoriteNumber = await contract.methods.retrieve().call();
  console.log("Transaction Receipt: ", transactionReceipt);
  console.log(`Updated favorite number: ${updatedFavoriteNumber}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
