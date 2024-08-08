export const jp = (body: string) => {
  try {
    return JSON.parse(body);
  } catch (e) {
    return {};
  }
};
