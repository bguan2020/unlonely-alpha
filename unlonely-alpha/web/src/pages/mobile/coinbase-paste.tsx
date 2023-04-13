import React, { useState } from "react";
import { Box } from "@chakra-ui/react";

export default function MobileCoinbasePaste() {
  const [done, setDone] = useState(false);

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();

    const localStorageObj = JSON.parse(text);
    for (const key in localStorageObj) {
      if (localStorageObj.hasOwnProperty(key)) {
        localStorage.setItem(key, localStorageObj[key]);
      }
    }

    setDone(true);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100svh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: 20,
      }}
    >
      <div>
        {!done && (
          <Box marginTop={10}>
            <button
              onClick={handlePaste}
              style={{
                padding: "10px 20px",
                backgroundColor: "white",
                borderRadius: 12,
              }}
            >
              paste session
            </button>
          </Box>
        )}
        {done && <p>all done. you can close this window now.</p>}
      </div>
    </div>
  );
}
