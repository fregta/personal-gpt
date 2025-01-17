import { useState, useRef, useEffect } from "react";
import OpenAI from "openai";
import { ApiKeyInput } from "./components/ApiKeyInput";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import type { Message, ChatState } from "./types/chat";
import { Moon, Sun } from 'lucide-react';

function App() {
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY || "");
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openai = useRef<OpenAI | null>(null);
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (apiKey?.startsWith('sk-')) {
      initializeChat(apiKey);
    }
  }, [apiKey]);

  const initializeChat = (key: string) => {
    if (!key.startsWith("sk-")) {
      alert("Please enter a valid OpenAI API key");
      return;
    }
    try {
      openai.current = new OpenAI({ apiKey: key, dangerouslyAllowBrowser: true });
      setApiKey(key);
      setChatState(prev => ({
        ...prev,
        messages: [],
        error: null
      }));
    } catch (error) {
      console.error("Error initializing OpenAI client:", error);
      alert("Failed to initialize chat. Please check your API key.");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

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
      messages: newMessages,
      isLoading: true,
      error: null,
    }));

    try {
      const completion = await openai.current.chat.completions.create({
        model: image ? "gpt-4o" : "gpt-4o",
        messages: newMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        max_tokens: 500,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: completion.choices[0]?.message?.content || "No response",
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error("OpenAI API error:", error);
      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Error communicating with OpenAI",
      }));
    }
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return openai.current ? (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-4 flex justify-end">
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
      <div className="flex-1 overflow-y-auto">
        {chatState.messages.map((message, index) => (
          <ChatMessage key={`chat_${index}`} message={message} isStreaming/>
        ))}
        {chatState.isLoading && (
          <div className="p-4 text-center text-gray-500">Thinking...</div>
        )}
        {chatState.error && (
          <div className="p-4 text-center text-red-500">{chatState.error}</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={chatState.isLoading}
      />
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
