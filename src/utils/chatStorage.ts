import OpenAI from "openai";
import { Chat, ChatStorage, Message } from "../types/chat";


export const generateChatTitle = async (messages: Message[], openai: OpenAI): Promise<string> => {
  try {
    const firstMessage = messages[0].content;
    const prompt = `Generate a short, descriptive title (max 6 words) for this chat based on the first message: "${firstMessage}"`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 30,
    });

    const title = response.choices[0]?.message?.content?.trim() || String(firstMessage).slice(0, 50);
    return title;
  } catch (error) {
    console.error('Error generating chat title:', error);
    return String(messages[0].content).slice(0, 50);
  }
};


export const saveChatHistory = (chatId: string, messages: Message[], title?: string) => {
  try {
    const storage = localStorage.getItem('chatHistory');
    const chatHistory: ChatStorage = storage ? JSON.parse(storage) : {};
    
    if (!chatHistory[chatId]) {
      chatHistory[chatId] = {
        title: title || '',
        messages: messages,
      };
    } else {
      chatHistory[chatId].messages = messages;
      if (title) {
        chatHistory[chatId].title = title;
      }
    }
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
};

export const getChatHistory = (chatId: string): Chat | null => {
  try {
    const storage = localStorage.getItem('chatHistory');
    if (!storage) return null;
    
    const chatHistory: ChatStorage = JSON.parse(storage);
    return chatHistory[chatId] || null;
  } catch (error) {
    console.error('Error getting chat history:', error);
    return null;
  }
};

export const getAllChats = (): ChatStorage => {
  try {
    const storage = localStorage.getItem('chatHistory');
    return storage ? JSON.parse(storage) : {};
  } catch (error) {
    console.error('Error getting all chats:', error);
    return {};
  }
};

export const deleteChat = (chatId: string): void => {
  try {
    const storage = localStorage.getItem('chatHistory');
    if (!storage) return;
    
    const chatHistory: ChatStorage = JSON.parse(storage);
    delete chatHistory[chatId];
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  } catch (error) {
    console.error('Error deleting chat:', error);
  }
}; 

export const clearChatHistory = () => {
  localStorage.removeItem('chatHistory');
};