import AWS from "aws-sdk";

export const calculateMaxWinnerTokensToMint = async (
    weiAmount: number,
    tokenSupply: number,
  ): Promise<{
    error: string | null;
    maxNumTokens: number;
  }> => {
    const total_fee_percent: number = 10 * 10 ** 16; // 5% protocol fee and 5% streamer fee
    const lambda = new AWS.Lambda({
      region: "us-west-2",
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    });
  
    const params = {
      FunctionName: "calcMaxNumTokensCanBuy",
      Payload: JSON.stringify({
        detail: {
          wei_amount: weiAmount,
          token_supply: tokenSupply,
          total_fee_percent: total_fee_percent,
        },
      }),
    };
  
    const maxNumTokensResponse = await lambda.invoke(params).promise();
    const parsedResponse = JSON.parse(maxNumTokensResponse.Payload as any);
    if (parsedResponse.errorMessage) {
      console.error(
        "lambda calculate max tokens error:",
        parsedResponse.errorMessage
      );
      return {error: parsedResponse.errorMessage, maxNumTokens: 0};
    } else {
      const maxNumTokens: number = parsedResponse.body as number;
      return {error: null, maxNumTokens};
    }
  };