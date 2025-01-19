import { ChatStorage } from "../types/chat";
import { MessageSquare, X } from "lucide-react";

interface ChatSidebarProps {
  chats: ChatStorage;
  currentChatId: string;
  onChatSelect: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatSidebar({ chats, currentChatId, onChatSelect, onDeleteChat }: ChatSidebarProps) {
  return (
    <div className="w-72 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Chat History
        </h2>
        <div className="space-y-2">
          {Object.entries(chats).map(([id, chat]) => (
            <div
              key={id}
              className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer ${
                currentChatId === id ? 'bg-gray-200 dark:bg-gray-800' : ''
              }`}
            >
              <div 
                className="flex items-center space-x-2 flex-1 truncate"
                onClick={() => onChatSelect(id)}
              >
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {chat.title || 'Untitled Chat'}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(id);
                }}
                className="p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 