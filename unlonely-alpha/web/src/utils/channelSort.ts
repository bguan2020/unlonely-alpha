import { Channel } from "../generated/graphql";

export const sortChannels = (channels: Channel[]): Channel[] => {
  return channels.sort((a, b) => {
    // If both channels have owner usernames
    if (a.owner.username && b.owner.username) {
      return a.owner.username.localeCompare(b.owner.username);
    }
    // If only one of the channels has an owner username
    if (a.owner.username) return -1; // a comes first
    if (b.owner.username) return 1; // b comes first

    // If neither channel has an owner username but both have addresses
    if (a.owner.address && b.owner.address) {
      return a.owner.address.localeCompare(b.owner.address);
    }
    return 0;
  });
};
