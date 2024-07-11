import axios from "axios";

type FollowType = {
  object: string;
  fid: number
  viewer_context:{
    following: boolean,
    followed_by: boolean
  }
}

type NeynarReturnType = {
  users: FollowType[],
}

export async function isFollowing(
  userFid: number,
  author: number
): Promise<boolean> {
  const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${userFid}&viewer_fid=${author}`
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      api_key: String(process.env.NEXT_PUBLIC_NEYNAR_API_KEY),
    },
  };

  console.log("userFid: ", userFid,"viewer_fid", author);

  // Function to fetch a page of data
  const fetchData = async (): Promise<NeynarReturnType> => {
    const response = await axios.get(url, {
      ...options
    }).then((res) => res.data).catch((error) => {
      console.error("Error fetching neynar data:", error);
      return {
        users: [],
      };
    });
    return response;
  };

  const data = await fetchData();

  const isFollowing = data.users[0].viewer_context.followed_by

  console.log ("is user following? ", isFollowing)
  return isFollowing;
}
