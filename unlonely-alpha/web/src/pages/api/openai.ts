import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai-api";

declare const process: {
  env: {
    OPEN_AI_API_KEY: string;
  };
};

const openai = new OpenAI(process.env.OPEN_AI_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prompt = req.body.prompt;
  let result: string;
  try {
    const gptResponse = await openai.complete({
      engine: "text-davinci-002",
      prompt: prompt,
      maxTokens: 100,
      temperature: 0,
      topP: 1,
      presencePenalty: 0,
      frequencyPenalty: 0.5,
    });
    result = gptResponse.data.choices[0].text;
  } catch (e) {
    result = "Sorry, I seem to be malfunctioning. Please try again later.";
  }

  res.status(200).json(result);
}
