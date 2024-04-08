import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";

const FEE_DESTINATION = "0x53D6D64945A67658C66730Ff4a038eb298eC8902";
const ONE_ETHER = BigInt(10) ** BigInt(18);

const PROTOCOL_FEE_PERCENT = 5;
const CREATOR_FEE_PERCENT = 5;

const BIGINT_PROTOCOL_FEE_PERCENT = (ONE_ETHER * BigInt(PROTOCOL_FEE_PERCENT)) / BigInt(100);
const BIGINT_CREATOR_FEE_PERCENT = (ONE_ETHER * BigInt(CREATOR_FEE_PERCENT)) / BigInt(100);

const STARTING_TOTAL_SUPPLY_THRESHOLD = 3_000_000;

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  await deploy("TempTokenFactoryV1", {
    from: deployer,
    args: [FEE_DESTINATION, BIGINT_PROTOCOL_FEE_PERCENT, BIGINT_CREATOR_FEE_PERCENT, STARTING_TOTAL_SUPPLY_THRESHOLD],
    log: true
  })
};
export default func;

func.tags = ["All", "TempTokenFactoryV1"]

/** 
npx hardhat deploy --network base_sepolia --tags All,TempTokenFactoryV1
npx hardhat --network base_sepolia etherscan-verify
*/