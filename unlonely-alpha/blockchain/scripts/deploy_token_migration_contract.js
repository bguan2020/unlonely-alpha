const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  const Token = await hre.ethers.getContractFactory("UnlonelyCreatorToken");

  const initialHolders = [{ account: "0xeee47759561f8754b555e85e903d0b245fe7ea1f", amount: hre.ethers.utils.parseEther("999950.0") }, { account: "0x141edb16c70307cf2f0f04af2dda75423a0e1bea", amount: hre.ethers.utils.parseEther("50.0") }];


  const token = await Token.deploy("DurkenUnlonelyToken", "DURKEN", hre.ethers.utils.parseEther("1000000"), "0xeEE47759561f8754b555e85e903D0b245fE7EA1f", initialHolders);

  await token.deployed();

  console.log("Token deployed to:", token.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });






