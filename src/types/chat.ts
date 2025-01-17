export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | ImageContent[];
}

export interface ImageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}