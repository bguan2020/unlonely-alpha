const hre = require("hardhat");

async function main() {
  // first deploy token contract
  const contract = await hre.ethers.getContractFactory("BrianToken");
  const BrianToken = await contract.deploy(
    "BrianToken",
    "BRIAN",
    "1000000000000000000000000" // 1 million tokens
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

  console.log("token deployed to:", BrianTokenAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
