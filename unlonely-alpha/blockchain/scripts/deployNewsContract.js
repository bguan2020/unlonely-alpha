const hre = require("hardhat");

async function main() {
  const NewsContract = await hre.ethers.getContractFactory("NewsContract");
  const tm = await NewsContract.deploy(
    "0x24f143c3e00c04955f1E0B65823cF840c8aF2B36"
  );

  await tm.deployed(1000);

  console.log("NewsContract deployed to:", tm.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
