import axios from "axios";



export async function isFollowing(userFid: number, author: number): Promise<boolean> {
    const url = `https://api.neynar.com/v2/farcaster/following?fid=${userFid}&viewer_fid=${author}&sort_type=desc_chron&limit=100`;
    const options = {
      method: "GET",
      headers: {accept: "application/json", api_key: String(process.env.NEXT_PUBLIC_NEYNAR_API_KEY)}
    };

    console.log("userFid: ", userFid, "viewer_fid", author)

    let isFollowing = false;
    let hasMoreData = true;
    let nextCursor = null;

    // Array to store promises for concurrent requests
    const fetchPromises = [];

    // Function to fetch a page of data
    const fetchData = async (cursor: any) => {
      const response = await axios.get(url, {
        ...options,
        params: cursor ? { cursor } : {},
      });
      return response.data;
    };

    // Fetch the first page of data
    let data = await fetchData(null);
    let count = 0;

    console.log("Data: ", data)

    while (hasMoreData) {
      // Check if userFid is in the list of followers
      console.log(++count)
      if (data.users.some((follow:any) => follow.user.fid === author)) {
        isFollowing = true;
        break;
      }

      // If there's more data, prepare to fetch the next page
      if (data.next && data.next.cursor) {
        nextCursor = data.next.cursor;
        fetchPromises.push(fetchData(nextCursor));

        // Fetch next batch in parallel
        if (fetchPromises.length >= 5) { // You can adjust the batch size as needed
          const results: any = await Promise.all(fetchPromises);
          fetchPromises.length = 0; // Clear the promises array
          for (const result of results) {
            if (result.users.some(((follow: any )=> follow.user.fid === author))) {
              isFollowing = true;
              hasMoreData = false;
              break;
            }
            if (result.next && result.next.cursor) {
              nextCursor = result.next.cursor;
              fetchPromises.push(fetchData(nextCursor));
            } else {
              hasMoreData = false;
            }
          }
        }
      } else {
        hasMoreData = false;
      }

      if (isFollowing) {
        break;
      }

      // Fetch the next page of data
      if (fetchPromises.length === 0 && nextCursor) {

        data = await fetchData(nextCursor);
      }
    }

    if (isFollowing) {
      console.log("User is following");
      return true
    } else {
      console.log("User is not following");
      return false
    }
  }