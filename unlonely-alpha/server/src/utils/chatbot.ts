import * as Ably from "ably";
import OpenAI from "openai-api";

const openai = new OpenAI(
  "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"
);

async function getOpenAIResponse() {
  const prompt_brian =
    "Brian is a 24 year old asian male living in Los Angeles. He has two cats, is a founder of a live-streaming company, and enjoys playing basketball. Roast Brian 5 different ways.";
  const prompt_unlonely =
    "Unlonely is a new web3 live-streaming platform. It features Brian, who is the main host, and lets you view ENS names and NFTs. Its relatively new, and has few users. Roast Unlonely 5 different ways.";
  let roasts: Array<string> = [];
  try {
    const brianResponse = await openai.complete({
      engine: "text-davinci-002",
      prompt: prompt_brian,
      maxTokens: 500,
      temperature: 0.7,
      topP: 1,
      presencePenalty: 0,
      frequencyPenalty: 0,
    });
    const brianRoast = brianResponse.data.choices[0].text;
    const unlonelyResponse = await openai.complete({
      engine: "text-davinci-002",
      prompt: prompt_unlonely,
      maxTokens: 100,
      temperature: 0.7,
      topP: 1,
      presencePenalty: 0,
      frequencyPenalty: 0,
    });
    const unlonelyRoast = unlonelyResponse.data.choices[0].text;
    //remove all the newlines in brianRoast and unlonelyRoast
    const brianRoastClean = brianRoast.replace(/(\r\n|\n|\r)/gm, "");
    const unlonelyRoastClean = unlonelyRoast.replace(/(\r\n|\n|\r)/gm, "");
    //split brianRoastClean by numbers+period
    const brianRoastSplit = brianRoastClean.split(/[0-9]+\./);
    //split unlonelyRoastClean by numbers+period
    const unlonelyRoastSplit = unlonelyRoastClean.split(/[0-9]+\./);

    roasts = brianRoastSplit.concat(unlonelyRoastSplit);
    roasts = roasts.filter((item) => item);
    console.log(roasts);
  } catch {
    console.log("error");
  }
  return roasts;
}

(async () => {
  const gpt3Response = await getOpenAIResponse();
  // interate through gpt3Response and send each roast to Ably
  const ably = new Ably.Realtime(
    "3VOgOg.UFzg4A:JS73B64vy2bHzqTkDK-SKhIeC-095PKu5kMtFJ4oq1A"
  );
  const channel = ably.channels.get("persistMessages:chat-demo");
  for (let i = 0; i < gpt3Response.length; i++) {
    channel.publish({
      name: "chat-message",
      data: {
        messageText: `${gpt3Response[i]}`,
        username: "roastbot😈",
        chatColor: "black",
        address: "0x0000000000000000000000000000000000000000",
        isFC: false,
      },
    });
    // wait 10 minutes before sending the next roast
    await new Promise((r) => setTimeout(r, 600000));
  }
})();
