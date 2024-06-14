import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";

const FEE_DESTINATION = "0x04394beD1a6cBd8E93F70E2F4c88396697BF714f"; // todo: change to 0x53D6D64945A67658C66730Ff4a038eb298eC8902 on production
const ONE_ETHER = BigInt(10) ** BigInt(18);

const PROTOCOL_FEE_PERCENT = 7;
const CREATOR_FEE_PERCENT = 7;

const BIGINT_PROTOCOL_FEE_PERCENT = (ONE_ETHER * BigInt(PROTOCOL_FEE_PERCENT)) / BigInt(100);
const BIGINT_CREATOR_FEE_PERCENT = (ONE_ETHER * BigInt(CREATOR_FEE_PERCENT)) / BigInt(100);

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  await deploy("TempTokenFactoryV1", {
    from: deployer,
    args: [FEE_DESTINATION, BIGINT_PROTOCOL_FEE_PERCENT, BIGINT_CREATOR_FEE_PERCENT],
    log: true
  })
};
export default func;

func.tags = ["All", "TempTokenFactoryV1"]

/** 
npx hardhat deploy --network base --tags All,TempTokenFactoryV1
npx hardhat --network base etherscan-verify
*/