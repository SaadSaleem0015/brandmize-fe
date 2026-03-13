// types/inbox.types.ts

// ---------------------------------------------------------------------------
// Shared channel union — single source of truth
// ---------------------------------------------------------------------------
export type Channel = 'instagram' | 'messenger' | 'whatsapp';

// ---------------------------------------------------------------------------
// Participant
// ---------------------------------------------------------------------------
export interface Participant {
  id: number;
  name: string;
  username: string;
  profile_picture_url: string | null; // API can return null (seen in messenger conv)
  channel: Channel;
}

// ---------------------------------------------------------------------------
// Conversation  (GET /omni/conversations)
// last_message_at → ISO-8601 string  e.g. "2026-03-13T04:25:48.778000+00:00"
// ---------------------------------------------------------------------------
export interface Conversation {
  id: number;
  participant: Participant;
  last_message_preview: string | null;  // null when first message is attachment
  last_message_at: string;              // ISO-8601 — use new Date(last_message_at)
  unread_count: number;
  channel: Channel;
  status: 'active' | 'resolved' | 'spam';
  assigned_to?: string;
}

// ---------------------------------------------------------------------------
// Message  (GET /omni/conversations/:id/messages)
// timestamp → Unix milliseconds  e.g. 1773325842409
// ---------------------------------------------------------------------------
export type MessageSender = 'agent' | 'customer';

export type MessageType = 'text' | 'image' | 'file' | 'video' | 'attachment';

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: number;
  content: string | null;   // null when type is 'attachment'
  sender: MessageSender;
  timestamp: number;         // Unix ms — use new Date(timestamp)
  type: MessageType;
  media_url: string | null;
  status?: MessageStatus;    // optional — not returned by backend
}

// ---------------------------------------------------------------------------
// WebSocket events
// ---------------------------------------------------------------------------
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