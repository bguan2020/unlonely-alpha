const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  const SharesContract = await hre.ethers.getContractFactory("UnlonelySharesV1");
  const contract = await SharesContract.deploy();

  await contract.deployed();

  console.log("UnlonelySharesV1 deployed to:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
