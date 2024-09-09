import { useState, useCallback } from "react";
import { ChatBot } from "../../constants/types";

export const useChatBotState = () => {
  const [chatBot, setChatBot] = useState<ChatBot[]>([]);
  
  const addToChatbot = useCallback((chatBotMessageToAdd: ChatBot) => {
      setChatBot((prev) => [...prev, chatBotMessageToAdd]);
    }, []);

  return { chatBot, addToChatbot };
}