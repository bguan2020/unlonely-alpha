// these functions are currently not in use, but they might be used in the future.

import { promises as fs } from "fs";

// Reading JSON from the file
export async function readJson(filePath: string) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading the JSON file:", error);
  }
}

// Writing JSON to the file
export async function writeJson(filePath: string, content: any) {
  try {
    const data = JSON.stringify(content, null, 2);
    await fs.writeFile(filePath, data, "utf8");
    console.log("JSON file has been written successfully");
  } catch (error) {
    console.error("Error writing JSON to the file:", error);
  }
}

export async function updateJson(filePath: string, compare: (data: any) => {data: any, changeDetected: boolean}) {
  try {
    const data = await readJson(filePath);
    const {data: newData, changeDetected} = compare(data);
    if (changeDetected) {
      await writeJson(filePath, newData);
    }
  } catch (error) {
    console.error("Error updating the JSON file:", error);
  }
}