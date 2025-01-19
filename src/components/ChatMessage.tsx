import { clsx } from 'clsx';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types/chat';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  const renderContent = (content: string) => {
    if (isUser) {
      return <p className="whitespace-pre-wrap dark:text-gray-200">{content}</p>;
    }

    return (
      <ReactMarkdown
        className="prose prose-sm max-w-none dark:prose-invert prose-headings:dark:text-gray-200 prose-p:dark:text-gray-300"
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div
      className={clsx(
        'flex gap-4 p-4',
        isUser ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700',
        message.isStreaming && 'border-l-4 border-green-500'
      )}
    >
      <div className="flex-shrink-0">
        {isUser ? (
          <User className="w-6 h-6 text-blue-500" />
        ) : (
          <Bot className="w-6 h-6 text-green-500" />
        )}
      </div>
      <div className="flex-1">
        {Array.isArray(message.content) ? (
          message.content.map((content, index) => (
            <div key={index} className="mb-2">
              {content.type === 'text' && renderContent(content.text || '')}
              {content.type === 'image_url' && content.image_url && (
                <img
                  src={content.image_url.url}
                  alt="Uploaded content"
                  className="max-w-sm rounded-lg shadow-md"
                />
              )}
            </div>
          ))
        ) : (
          renderContent(message.content)
        )}
      </div>
    </div>
  );
}