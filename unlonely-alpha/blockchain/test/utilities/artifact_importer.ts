/**
 * Tools such as MythX require contracts to be preprocessed.
 * The main advantage of Artifact Importer is it's ability to seamlessly switch between raw and processed contracts.
 * It also removes repetitive code from the tests.
 */

import { config as dotenv_config } from "dotenv";
dotenv_config();
import { ContractJSON } from "ethereum-waffle/dist/esm/ContractJSON";

export interface ArtifactImports { [contract_name: string]: ContractJSON };

export const EMPTY_ARTIFACTS: ArtifactImports = {};

export async function import_artifacts() {
    const artifacts: ArtifactImports = {};

    const artifact_dir = process.env.USE_PROCESSED_FILES === "true" ? "../../artifacts/contracts_processed" : "../../artifacts/contracts";
    artifacts.BrianTokenContract = await tryImport(`${artifact_dir}/BrianTokenContract.sol/BrianToken.json`)
    artifacts.UnlonelyArcadeContractV2 = await tryImport(`${artifact_dir}/UnlonelyArcadeContractV2.sol/UnlonelyArcadeContractV1.json`)
    artifacts.UnlonelyNFCsV2 = await tryImport(`${artifact_dir}/UnlonelyNFCsV2.sol/UnlonelyNFCsV2.json`)
    artifacts.UnlonelySharesV1 = await tryImport(`${artifact_dir}/UnlonelySharesV1.sol/UnlonelySharesV1.json`)

    return artifacts
}

async function tryImport(filepath: string) {
    try {
      return await import(filepath);
    } catch(e) {
      return undefined;
    }
  }