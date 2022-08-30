import axios from "axios";
import { User } from "../generated/graphql";

export const checkPOAP = async (user: User) => {
  const { data } = await axios.get(
    `https://frontend.poap.tech/actions/scan/${user.address}`
  );
  let poapCount = 0;
  // iterate through data array
  for (let i = 0; i < data.length; i++) {
    // if data[i].event.name contains "Unlonely"
    if (data[i].event.name.includes("Unlonely")) {
      poapCount++;
    }
  }

  return poapCount;
};
