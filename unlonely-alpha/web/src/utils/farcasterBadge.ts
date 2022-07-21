import axios from "axios";

export const isFCUser = async (address: string) => {
  const data = await axios.get(
    `https://searchcaster.xyz/api/profiles?connected_address=${address}`
  );
  try {
    if (data.data[0].body) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
