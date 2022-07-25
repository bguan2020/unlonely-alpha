import React, { useEffect } from "react";
import { useRouter } from "next/router";

import AppLayout from "../components/layout/AppLayout";

export default function Page() {
  // immediately route to "/"
  const router = useRouter();
  useEffect(() => {
      router.push("/");
  }, []);

  return (
    <AppLayout/>
  );
}

// export async function getStaticProps() {
//   const API_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

//   return { props: {} };
// }
