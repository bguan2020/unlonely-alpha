const hre = require("hardhat");

async function main() {
  // first deploy token contract
  const tokenContract = await hre.ethers.getContractFactory("BrianToken");
  const BrianToken = await tokenContract.deploy(
    "BrianToken",
    "BRIAN",
    "1000000000000000000000000000" // 1 million tokens
  );

  const BrianTokenAddress = BrianToken.address;

  await BrianToken.deployed(1000);
  let contractBalance;
  contractBalance = await BrianToken.balanceOf(BrianTokenAddress);

  let ownerBalance;
  ownerBalance = await BrianToken.balanceOf(
    "0x141Edb16C70307Cf2F0f04aF2dDa75423a0E1bEa"
  );

  console.log("contract balance: ", contractBalance);
  console.log("owner balance: ", ownerBalance);

  console.log("BRIAN deployed to:", BrianTokenAddress);

  // then deploy arcade contract
  const contract = await hre.ethers.getContractFactory("UnlonelyArcadeContract");
  const ArcadeContract = await contract.deploy(
    BrianTokenAddress, // creatorToken address
    2000 // price: #tokens for 1 ETH (2000 means 1 ETH = 2000 tokens)
  );

  const ArcadeContractAddress = ArcadeContract.address;
  console.log("ArcadeContract deployed to:", ArcadeContractAddress);

  await ArcadeContract.deployed(1000);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
