const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  const Nfc = await hre.ethers.getContractFactory("UnlonelyNFCsV2");
  const nfc = await Nfc.deploy("UnlonelyNFCsV2", "LNLY");

  await nfc.deployed();

  console.log("Nfc deployed to:", nfc.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
