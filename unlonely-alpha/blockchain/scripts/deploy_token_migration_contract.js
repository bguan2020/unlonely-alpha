const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  const Token = await hre.ethers.getContractFactory("UnlonelyCreatorToken");

  // List of initial holders and their balances
  const initialHolders = [
      { account: "0x141edb16c70307cf2f0f04af2dda75423a0e1bea", amount: hre.ethers.utils.parseEther("507573") },
      { account: "0x1a7eeb35a5aebf56b80d324a34b049c8e3248acc", amount: hre.ethers.utils.parseEther("483414.5") },
      { account: "0x6db4d0682d7d7bb68bd00c774dbdd05b91925c13", amount: hre.ethers.utils.parseEther("4400") },
      { account: "0x39d4cfb24b6431297b62bcff03748f21e2617d7a", amount: hre.ethers.utils.parseEther("420") },
      { account: "0x2e21f5d32841cf8c7da805185a041400bf15f21a", amount: hre.ethers.utils.parseEther("400") },
      { account: "0xee3ca4dd4ceb3416915eddc6cdadb4a6060434d4", amount: hre.ethers.utils.parseEther("400") },
      { account: "0x7e5f14b0910abd7b361d2df7770a5aa3a853ef59", amount: hre.ethers.utils.parseEther("395.5") },
      //... all the other addresses and amounts until the last one...
      { account: "0xa49958fa14309f3720159c83cd92c5f38b1e3306", amount: hre.ethers.utils.parseEther("5") },
      { account: "0x1adc09fa9a173a13dc5b4e0f85d1edf7a8c10f50", amount: hre.ethers.utils.parseEther("5") },
      { account: "0x32bea430631db4e416900db332f5431d265a954a", amount: hre.ethers.utils.parseEther("5") }
  ];

  const token = await Token.deploy("BrianToken", "BRIAN", hre.ethers.utils.parseEther("1000000"), "0x141Edb16C70307Cf2F0f04aF2dDa75423a0E1bEa", initialHolders);

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






