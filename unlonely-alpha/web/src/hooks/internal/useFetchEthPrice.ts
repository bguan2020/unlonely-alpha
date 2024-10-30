import * as AWS from "aws-sdk";
import { useState, useRef, useEffect } from "react";
import { getCoingeckoTokenPrice } from "../../utils/coingecko";
import { useRouter } from "next/router";

export const useFetchEthPrice = () => {
  const [ethPriceInUsd, setEthPriceInUsd] = useState<string>("0");
  const isFetchingPrice = useRef(false);

  const router = useRouter(); // Get the current route

  useEffect(() => {
    if (router.pathname === "/" || router.pathname === "/modcenter") return; // Skip fetching for routes that don't need the price

    const interval = setInterval(() => {
      const init = async () => {
        if (typeof window === "undefined" || isFetchingPrice.current) return;
        isFetchingPrice.current = true;
        const value = localStorage.getItem("unlonely-eth-price-usd-v0");
        const dateNow = new Date().getTime();
        if (value) {
          const parsedValue = JSON.parse(value);
          const price = parsedValue.price;
          const timestamp = parsedValue.timestamp;
          if (dateNow - timestamp < 1000 * 60 * 5) {
            setEthPriceInUsd(price);
            isFetchingPrice.current = false;
            return;
          }
        }
        try {
          const lambda = new AWS.Lambda({
            region: "us-west-2",
            accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
            secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
          });

          const params = {
            FunctionName: "getTokenPrices",
            Payload: JSON.stringify({}),
          };

          const response = await lambda.invoke(params).promise();
          const parsedResponse = JSON.parse(response.Payload as any);
          if (parsedResponse.statusCode !== 200) {
            throw new Error("error fetching eth price from lambda");
          }
          const price = String(JSON.parse(parsedResponse.body).ethereum);
          localStorage.setItem(
            "unlonely-eth-price-usd-v0",
            JSON.stringify({
              price,
              timestamp: dateNow,
            })
          );
          setEthPriceInUsd(price);
        } catch (e) {
          console.log("error fetching eth price, switching to coingecko", e);
          try {
            const price = await getCoingeckoTokenPrice("ethereum", "usd");
            localStorage.setItem(
              "unlonely-eth-price-usd-v0",
              JSON.stringify({
                price,
                timestamp: dateNow,
              })
            );
            if (price !== undefined) setEthPriceInUsd(price);
          } catch (e) {
            console.log("error fetching eth price from coingecko", e);
          }
        }
        isFetchingPrice.current = false;
      };
      init();
    }, 5000);

    return () => clearInterval(interval);
  }, [router.pathname]); // Dependency array includes the current route

  return ethPriceInUsd;
};
