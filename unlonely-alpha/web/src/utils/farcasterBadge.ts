import axios from "axios";

export const isFCUser = async (address: string) => {
  try {
    const response = await fetch(
      `https://ancient-journey-82291.herokuapp.com/https://searchcaster.xyz/api/profiles?connected_address=${address}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "no-cors": "true",
        },
      }
    );
    const data = await response.json();
    if (data[0].body) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
};
