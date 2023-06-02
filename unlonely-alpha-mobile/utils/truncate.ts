export const truncate0x = (address: string) => {
  return address.slice(0, 6) + '...' + address.slice(address.length - 4);
};

export const truncateEns = (ens: string) => {
  if (ens.length > 20) return ens.slice(0, 12) + '...' + ens.slice(ens.length - 8);
  return ens;
};
