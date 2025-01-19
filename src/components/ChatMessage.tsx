import { clsx } from 'clsx';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types/chat';

//@ts-expect-error react-syntax-highlighter types are not compatible with react-markdown
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
//@ts-expect-error react-syntax-highlighter types are not compatible with react-markdown
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { ClipboardCopy } from 'lucide-react';

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
        components={{
          code: CodeBlock
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    if (inline) {
      return <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded" {...props}>{children}</code>;
    }

    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    const copyToClipboard = (code: string) => {
      navigator.clipboard.writeText(code);
    };

    return (
      <div className="relative group">
        <button
          onClick={() => copyToClipboard(String(children))}
          className="absolute right-2 top-2 p-1 rounded bg-gray-700/50 hover:bg-gray-700/75 invisible group-hover:visible"
          aria-label="Copy code"
        >
          <ClipboardCopy className="w-4 h-4 text-gray-300" />
        </button>
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          PreTag="div"
          className="!mt-0 !mb-4"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
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