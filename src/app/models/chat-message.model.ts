export interface ChatMessage {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface Message {
  content: string;
  sender: string;
}
