export const jp = (body: string) => {
  try {
    return JSON.parse(body);
  } catch (e) {
    return {};
  }
};

export const safeIncludes = (_var: any, val: string) => {
  try {
    return _var?.includes?.(val) ?? false;
  } catch (e) {
    return false;
  }
};
