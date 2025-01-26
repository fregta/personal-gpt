import { useState, useRef, useEffect, useMemo } from "react";
import OpenAI from "openai";
import { ApiKeyInput } from "./components/ApiKeyInput";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import type { Message, ChatState, ChatStorage } from "./types/chat";
import { Moon, Plus, Sun, Trash2 } from "lucide-react";
import {
  saveChatHistory,
  getChatHistory,
  clearChatHistory,
  generateChatTitle,
  getAllChats,
  deleteChat,
} from "./utils/chatStorage";
import { v4 as uuidv4 } from "uuid";
import { debounce } from "./utils/debounce";
import { ChatSidebar } from "./components/ChatSidebar";

function App() {
  const [apiKey, setApiKey] = useState(
    import.meta.env.VITE_OPENAI_API_KEY || ""
  );
  const [chatId, setChatId] = useState(() => {
    return uuidv4();
  });
  const [chatState, setChatState] = useState<ChatState>(() => {
    const savedMessages = getChatHistory(chatId);
    return {
      messages: savedMessages || [],
      isLoading: false,
      error: null,
    };
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openai = useRef<OpenAI | null>(null);
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });
  const [chats, setChats] = useState<ChatStorage>({});
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");

  useEffect(() => {
    if (apiKey?.startsWith("sk-")) {
      initializeChat(apiKey);
    }
  }, [apiKey]);

  useEffect(() => {
    setChats(getAllChats());
  }, [chatState.messages]);

  const initializeChat = (key: string) => {
    if (!key.startsWith("sk-")) {
      alert("Please enter a valid OpenAI API key");
      return;
    }
    try {
      openai.current = new OpenAI({
        apiKey: key,
        dangerouslyAllowBrowser: true,
      });
      setApiKey(key);
      setChatState((prev) => ({
        ...prev,
        messages: [],
        error: null,
      }));
    } catch (error) {
      console.error("Error initializing OpenAI client:", error);
      alert("Failed to initialize chat. Please check your API key.");
    }
  };

  const debouncedSave = useMemo(
    () =>
      debounce(
        async (messages: Message[], id: string, isNewChat?: boolean) => {
          let title;
          if (messages.length === 2 && openai.current) {
            try {
              title = await generateChatTitle(messages, openai.current);
            } catch (error) {
              console.error("Error generating chat title:", error);
            }
          }
          const chatHistory = saveChatHistory(id, messages, title);
          if (isNewChat && chatHistory) {
            setChats(chatHistory);
          }
        },
        1000
      ),
    [openai]
  );

  useEffect(() => {
    if (chatState.messages.length > 0 && openai.current) {
      debouncedSave(chatState.messages, chatId, chatState.messages.length === 2);
    }
  }, [chatState.messages, chatId, debouncedSave]);

  const handleSendMessage = async (text: string, image?: File) => {
    if (!openai.current) return;

    const newMessages: Message[] = [...chatState.messages];
    let userMessage: Message;

    if (image) {
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          const base64Data = base64String.split(",")[1];
          resolve(base64Data);
        };
        reader.readAsDataURL(image);
      });

      userMessage = {
        role: "user",
        content: [
          { type: "text", text },
          {
            type: "image_url",
            image_url: {
              url: `data:image/${image.type};base64,${base64Image}`,
            },
          },
        ],
      };
    } else {
      userMessage = { role: "user", content: text };
    }

    newMessages.push(userMessage);

    setChatState((prev) => ({
      ...prev,
      messages: [
        ...newMessages,
        { role: "assistant", content: "", isStreaming: true },
      ],
      isLoading: true,
      error: null,
    }));

    try {
      const stream = await openai.current.chat.completions.create({
        model: image ? "gpt-4-vision-preview" : selectedModel,
        messages: newMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        stream: true,
      });

      let accumulatedContent = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        accumulatedContent += content;

        setChatState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg, i) =>
            i === prev.messages.length - 1
              ? { ...msg, content: accumulatedContent }
              : msg
          ),
        }));
      }

      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg, i) =>
          i === prev.messages.length - 1
            ? { ...msg, content: accumulatedContent, isStreaming: false }
            : msg
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error("OpenAI API error:", error);
      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.slice(0, -1),
        isLoading: false,
        error: "Error communicating with OpenAI",
      }));
    }
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleDeleteChat = (id: string) => {
    deleteChat(id);
    if (id === chatId) {
      handleNewChat();
    }
    setChats(getAllChats());
  };

  const handleChatSelect = (id: string) => {
    setChatId(id);
    const selectedChat = getChatHistory(id);
    if (selectedChat) {
      setChatState((prev) => ({
        ...prev,
        messages: selectedChat.messages,
        error: null,
      }));
    }
  };

  const handleNewChat = () => {
    const newChatId = uuidv4();
    setChatState({
      messages: [],
      isLoading: false,
      error: null,
    });
    setChatId(newChatId);
  };

  return openai.current ? (
    <div className="flex flex-col min-h-screen h-max bg-gray-100 dark:bg-gray-900">
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Personal-GPT
        </h1>
        <div className="flex items-center gap-2">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700"
          >
            <option value="gpt-4o-mini">GPT-4 mini</option>
            <option value="gpt-4o">GPT-4o</option>
          </select>
          <button
            onClick={handleNewChat}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-2"
          >
            <Plus className="w-5 h-5 text-green-500" />
          </button>
          <button
            onClick={() => {
              clearChatHistory();
              handleNewChat();
              setChats({});
            }}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-2"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>
      <div className="flex flex-1">
        <div className="flex flex-col w-full justify-between">
          <div className="flex flex-col overflow-y-auto w-8/12 mx-auto gap-3">
            {chatState.messages.map((message, index) => (
              <ChatMessage key={`chat_${index}`} message={message} />
            ))}
            {chatState.isLoading && (
              <div className="p-4 text-center text-gray-500">Thinking...</div>
            )}
            {chatState.error && (
              <div className="p-4 text-center text-red-500">
                {chatState.error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={chatState.isLoading}
            model={selectedModel}
          />
        </div>
        <ChatSidebar
          chats={chats}
          currentChatId={chatId}
          onChatSelect={handleChatSelect}
          onDeleteChat={handleDeleteChat}
        />
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <ApiKeyInput
        apiKey={apiKey}
        setApiKey={setApiKey}
        onSubmit={initializeChat}
      />
    </div>
  );
}

export default App;
