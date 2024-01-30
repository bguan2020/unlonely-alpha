const fetchCoingeckoPrice =
  (fetchFunction: any) => async (ids: string, vs_currencies: string) => {
    try {
      const _ids = ids.toLowerCase();
      const _vs_currencies = vs_currencies.toLowerCase();
      // free version has a rate limit of 30 calls per minute
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${_ids}&vs_currencies=${_vs_currencies}`;
      const data = await fetchFunction(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await data.json();
      const price = result[_ids][_vs_currencies];
      return price ? `${price}` : undefined;
    } catch (_) {
      console.log(`fetchCoingeckoPrice, cannot fetch for ${ids}`, _);
      return undefined;
    }
  };

export const getCoingeckoTokenPrice = fetchCoingeckoPrice(
  typeof window !== "undefined" && window.fetch
);
