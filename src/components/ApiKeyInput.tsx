import React from 'react';
import { KeyRound } from 'lucide-react';

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  onSubmit: (apiKey: string) => void;
}

export function ApiKeyInput({ apiKey, setApiKey, onSubmit }: ApiKeyInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(apiKey);
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-center mb-6">
        <KeyRound className="w-8 h-8 text-blue-500" />
      </div>
      <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">Enter Your OpenAI API Key</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-200"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Start Chat
        </button>
      </form>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
        Your API key is stored locally and never sent to our servers.
      </p>
    </div>
  );
}