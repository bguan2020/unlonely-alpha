const main = async () => {
  const [owner, randomPerson] = await hre.ethers.getSigners();
  const NewsContractFactory = await hre.ethers.getContractFactory(
    "NewsContract"
  );
  const NewsContract = await NewsContractFactory.deploy();
  await NewsContract.deployed();

  console.log("Contract deployed to: ", NewsContract.address);
  console.log("Contract deployed by: ", owner.address);

  let contractBalance;
  contractBalance = await NewsContract.balanceOf(NewsContract.address);

  let ownerBalance;
  ownerBalance = await NewsContract.balanceOf(owner.address);

  console.log("contract balance: ", contractBalance);
  console.log("owner balance: ", ownerBalance);

  // create article
  const articleId = 1;
  const articleCreationTxn = await NewsContract.createArticle(articleId);
  console.log("article creation: ", articleCreationTxn);

  // create vote
  const voteCreationTxn = await NewsContract.vote(1, true);
  console.log("vote creation: ", voteCreationTxn);

  const payoutTxn = await NewsContract.payout(articleId);
  console.log("payout: ", payoutTxn);

  let newcontractBalance;
  newcontractBalance = await NewsContract.balanceOf(NewsContract.address);

  let newownerBalance;
  newownerBalance = await NewsContract.balanceOf(owner.address);

  console.log("new contract balance: ", newcontractBalance);
  console.log("new owner balance: ", newownerBalance);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
