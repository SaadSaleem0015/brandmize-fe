
export type Channel = 'instagram' | 'messenger' | 'whatsapp';


export interface Participant {
  id: number;
  name: string;
  username: string;
  profile_picture_url: string | null;
  channel: Channel;
}


export interface Conversation {
  id: number;
  participant: Participant;
  last_message_preview: string | null;
  last_message_at: string;              // ISO-8601
  unread_count: number;
  channel: Channel;
  status: 'active' | 'resolved' | 'spam';
  assigned_to?: string;
}


export type MessageSender = 'agent' | 'customer' | 'human_agent'; // Backend uses 'agent' for AI, 'human_agent' for human

export type MessageType = 'text' | 'image' | 'file' | 'video' | 'audio' | 'attachment';

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: number;
  content: string | null;
  sender: MessageSender;
  timestamp: number;         // Unix ms
  type: MessageType;
  media_url: string | null;
  status?: MessageStatus;    // Optional frontend-only
}


export interface ConversationUpdatePayload {
  id: number;
  last_message_preview?: string | null;
  last_message_at?: string;   // ISO-8601
  unread_count?: number;
}

export type WebSocketMessagePayload = Message;

export type WebSocketEventType =
  | 'new_message'
  | 'conversation_update'
  | 'connected'
  | 'error'
  | 'ping'
  | 'pong';

export interface WebSocketEvent {
  event: WebSocketEventType;
  conversation_id?: number;
  message?: WebSocketMessagePayload;
  conversation?: ConversationUpdatePayload;
  detail?: string;
}