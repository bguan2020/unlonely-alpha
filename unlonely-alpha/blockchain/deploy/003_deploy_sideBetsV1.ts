import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  await deploy("UnlonelySideBetsV1", {
    from: deployer,
    args: [],
    log: true
  })
};
export default func;

func.tags = ["All", "SideBetsV1"]

// npx hardhat deploy --network base_goerli --tags All,SideBetsV1
// npx hardhat --network base_goerli etherscan-verify