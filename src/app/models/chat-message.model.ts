export interface ChatMessage {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface Message {
  content: string;
  sender: string;
  imgUrl?: string; // Optional image URL for the message
  llm?: string; // Optional LLM model used for the message
  // Optional flags to indicate message state
  isStreaming?: boolean;
  isThinking?: boolean;
  isAborted?: boolean;
}
