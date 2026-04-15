// pages/Inbox.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageCircle, WifiOff } from "lucide-react";
import ChatWindow from "../Components/inbox/ChatWindow";
import ConversationList from "../Components/inbox/ConversationList";
import { api } from "../Helpers/BackendRequest";
import { notifyResponse } from "../Helpers/notyf";
import { Conversation, ConversationUpdatePayload, Message, WebSocketEvent } from "../Helpers/inbox.types";

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY_MS = 3000;
const RECONNECT_MAX_DELAY_MS = 30000;

function transformConversation(conv: any): Conversation {
  return {
    id: conv.id,
    participant: {
      id: conv.participant?.id ?? conv.id,
      name: conv.participant_name ?? conv.participant?.name ?? "Unknown",
      username: conv.participant_username ?? conv.participant?.username ?? "",
      profile_picture_url:
        conv.profile_picture_url ?? conv.participant?.profile_picture_url ??
        `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.participant_name ?? "User")}&background=7032e5&color=fff`,
      channel: conv.channel ?? conv.participant?.channel ?? "messenger",
    },
    last_message_preview: conv.last_message_preview ?? null,
    last_message_at: conv.last_message_at ?? new Date().toISOString(),
    unread_count: conv.unread_count ?? 0,
    channel: conv.channel ?? conv.participant?.channel ?? "messenger",
    status: conv.status ?? "active",
  };
}

function sortByLatest(list: Conversation[]): Conversation[] {
  return [...list].sort(
    (a, b) =>
      new Date(b.last_message_at).getTime() -
      new Date(a.last_message_at).getTime()
  );
}

export default function Inbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [isConnected, setIsConnected] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);

  const { conversationId } = useParams();
  const navigate = useNavigate();

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const reconnectAttempts = useRef(0);
  const activeConversationRef = useRef<number | null>(null);
  const conversationsRef = useRef<Conversation[]>([]);
  
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // WebSocket helpers
  const sendWsMessage = useCallback((payload: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/omni/conversations");
      if (response.data) {
        const transformed = response.data.map(transformConversation);
        setConversations(sortByLatest(transformed));
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      notifyResponse(error, "", "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle new message from WebSocket
  const handleNewMessage = useCallback(
    (conversationId: number, newMessage: Message) => {
      const isCustomer = newMessage.sender === "customer";
      const isAgent = newMessage.sender === "human_agent" || newMessage.sender === "agent";

      // Update conversations list - create if doesn't exist
      setConversations((prev) => {
        const existingIndex = prev.findIndex(conv => conv.id === conversationId);
        
        if (existingIndex !== -1) {
          // Update existing conversation
          const updated = prev.map((conv) => {
            if (conv.id !== conversationId) return conv;
            
            return {
              ...conv,
              last_message_preview: newMessage.content || (newMessage.type !== 'text' ? `[${newMessage.type}]` : ''),
              last_message_at: new Date(newMessage.timestamp).toISOString(),
              unread_count:
                isCustomer && activeConversationRef.current !== conversationId
                  ? conv.unread_count + 1
                  : conv.unread_count,
            };
          });
          return sortByLatest(updated);
        } else {
          // This is a new conversation from a new user
          console.log("Creating new conversation from message:", conversationId);
          
          // Create basic conversation
          const newConversation: Conversation = {
            id: conversationId,
            participant: {
              id: conversationId,
              name: newMessage.sender === 'customer' ? "New Customer" : "New User",
              username: "",
              profile_picture_url: `https://ui-avatars.com/api/?name=New+User&background=7032e5&color=fff`,
              channel: "messenger", // Default - will be updated later
            },
            last_message_preview: newMessage.content || (newMessage.type !== 'text' ? `[${newMessage.type}]` : ''),
            last_message_at: new Date(newMessage.timestamp).toISOString(),
            unread_count: isCustomer && activeConversationRef.current !== conversationId ? 1 : 0,
            channel: "messenger",
            status: "active",
          };
          
          return sortByLatest([...prev, newConversation]);
        }
      });

      // If this message belongs to the currently open conversation, add it to current messages
      if (activeConversationRef.current === conversationId) {
        setCurrentMessages((prev) => {
          // Check if message already exists (prevent duplicates)
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
      }

      // Show notification for customer messages when not in the conversation
      if (isCustomer && activeConversationRef.current !== conversationId) {
        // Try to find conversation in current list or use placeholder
        const conv = conversationsRef.current.find((c) => c.id === conversationId) || {
          participant: { name: "New User" }
        };
        
        notifyResponse({
          success: true,
          detail: `New message from ${conv.participant.name}`
        });
      }
      
    },
    []
  );

  // Handle conversation update from WebSocket
  const handleConversationUpdate = useCallback(
    (update: ConversationUpdatePayload) => {
      setConversations((prev) => {
        // Check if this conversation already exists
        const existingIndex = prev.findIndex(conv => conv.id === update.id);
        
        if (existingIndex !== -1) {
          // Update existing conversation
          const updated = prev.map((conv) => {
            if (conv.id !== update.id) return conv;
            
            // Get participant info from existing conversation or create placeholder
            const participant = conv.participant || {
              id: update.id,
              name: "New User",
              username: "",
              profile_picture_url: `https://ui-avatars.com/api/?name=New+User&background=7032e5&color=fff`,
              channel: "messenger" // Default channel
            };
            
            return {
              ...conv,
              participant,
              last_message_preview: update.last_message_preview ?? conv.last_message_preview,
              last_message_at: update.last_message_at ?? conv.last_message_at,
              unread_count: update.unread_count ?? conv.unread_count,
            };
          });
          return sortByLatest(updated);
        } else {
          // This is a NEW conversation - create it
          console.log("Adding new conversation to list:", update);
          
          // Create a basic conversation object from the update
          const newConversation: Conversation = {
            id: update.id,
            participant: {
              id: update.id,
              name: "New User",
              username: "",
              profile_picture_url: `https://ui-avatars.com/api/?name=New+User&background=7032e5&color=fff`,
              channel: "messenger",
            },
            last_message_preview: update.last_message_preview ?? null,
            last_message_at: update.last_message_at ?? new Date().toISOString(),
            unread_count: update.unread_count ?? 0,
            channel: "messenger",
            status: "active",
          };
          
          // Add to list and sort
          return sortByLatest([...prev, newConversation]);
        }
      });
      
    },
    []
  );

  // Fetch conversations
 

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      setWsError("Maximum reconnection attempts reached. Please refresh the page.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setWsError("No authentication token found");
      return;
    }

    // Close stale socket
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    // const wsUrl = `wss://app.brandmize.net/api/v1/omni/ws/dashboard?token=${token}`;
    const wsUrl = `ws://localhost:8000/api/v1/omni/ws/dashboard?token=${token}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      setWsError(null);
      reconnectAttempts.current = 0;

      // Re-open active chat if any
      if (activeConversationRef.current) {
        sendWsMessage({ 
          event: "open_chat", 
          conversation_id: activeConversationRef.current 
        });
      }
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketEvent = JSON.parse(event.data);
        console.log("WebSocket received:", data);

        switch (data.event) {
          case "new_message":
            if (data.conversation_id != null && data.message) {
              const newMsg = data.message;
              
              // Check if this message is from agent (echo)
              if (newMsg.sender === 'human_agent') {
                // This is an echo message - we need to UPDATE existing temp message
                setCurrentMessages(prev => {
                  // Try to find a matching temp message
                  const tempMessageIndex = prev.findIndex(msg => 
                    typeof msg.id === 'string' && 
                    msg.id.toString().startsWith('temp_') &&
                    msg.content === newMsg.content &&
                    msg.sender === 'human_agent' &&
                    Math.abs((msg.timestamp || 0) - (newMsg.timestamp || 0)) < 10000 // Within 10 seconds
                  );

                  if (tempMessageIndex !== -1) {
                    // Found temp message - UPDATE it with real data
                    const updatedMessages = [...prev];
                    updatedMessages[tempMessageIndex] = {
                      ...newMsg,
                      status: 'delivered' // Double tick
                    };
                    return updatedMessages;
                  }
                  
                  // No temp message found - this might be a message from another session
                  // Add it normally
                  return [...prev, { ...newMsg, status: 'delivered' }];
                });
              } else {
                // Message from customer - normal handling
                handleNewMessage(data.conversation_id, newMsg);
              }
            }
            break;

          case "conversation_update":
            if (data.conversation) {
              handleConversationUpdate(data.conversation);
            }
            break;

          case "ping":
            sendWsMessage({ event: "pong" });
            break;

          case "connected":
            console.log("WebSocket connection confirmed");
            break;

          case "error":
            console.error("WebSocket server error:", data);
            setWsError(data.detail || "Connection error occurred");
            break;
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
      setWsError("Connection error. Retrying…");
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);

      if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
        setWsError("Maximum reconnection attempts reached. Please refresh the page.");
        return;
      }

      reconnectAttempts.current += 1;
      const delay = Math.min(
        RECONNECT_MAX_DELAY_MS,
        RECONNECT_BASE_DELAY_MS * reconnectAttempts.current
      );

      reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
    };
  }, [handleNewMessage, handleConversationUpdate, sendWsMessage]);

  // Initial load
  useEffect(() => {
    fetchConversations();
    connectWebSocket();

    return () => {
      if (activeConversationRef.current) {
        sendWsMessage({ event: "close_chat" });
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
      clearTimeout(reconnectTimeoutRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle URL param
  useEffect(() => {
    if (!conversationId) return;

    const id = parseInt(conversationId, 10);
    if (isNaN(id)) return;

    setSelectedConversation(id);
    setMobileView("chat");
    
    // Clear current messages when switching conversations
    setCurrentMessages([]);

    if (activeConversationRef.current !== null && activeConversationRef.current !== id) {
      sendWsMessage({ event: "close_chat" });
    }

    activeConversationRef.current = id;
    sendWsMessage({ event: "open_chat", conversation_id: id });
    markAsRead(id);
  }, [conversationId, sendWsMessage]);

  // Mark conversation as read
  const markAsRead = useCallback(async (convId: number) => {
    try {
      await api.post(`/omni/conversations/${convId}/mark-read`);
      // Optimistic update
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c))
      );
    } catch (error) {
      console.error("Error marking conversation as read:", error);
    }
  }, []);

  // Select conversation
  const handleSelectConversation = useCallback(
    (id: number) => {
      // Already viewing this conversation — do nothing
      if (activeConversationRef.current === id) return;

      if (activeConversationRef.current !== null) {
        sendWsMessage({ event: "close_chat" });
      }

      activeConversationRef.current = id;
      sendWsMessage({ event: "open_chat", conversation_id: id });
      setSelectedConversation(id);
      setMobileView("chat");
      setCurrentMessages([]);
      navigate(`/inbox/${id}`);
      markAsRead(id);
    },
    [navigate, sendWsMessage, markAsRead]
  );

  // Back to list
  const handleBackToList = useCallback(() => {
    if (activeConversationRef.current) {
      sendWsMessage({ event: "close_chat" });
      activeConversationRef.current = null;
    }
    setMobileView("list");
    setCurrentMessages([]);
    navigate("/inbox");
  }, [navigate, sendWsMessage]);

  // Reconnect
  const handleReconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    clearTimeout(reconnectTimeoutRef.current);
    connectWebSocket();
  }, [connectWebSocket]);

  // Message sent callback
  const handleMessageSent = useCallback((newMessage: Message) => {
    setCurrentMessages(prev => {
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) return prev;
      return [...prev, newMessage];
    });
    fetchConversations();
  }, [fetchConversations]);

  const selectedConversationData = conversations.find(
    (c) => c.id === selectedConversation
  );

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary-600" />
              Unified Inbox
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              All your conversations from Instagram, Messenger, and WhatsApp
            </p>
          </div>

          {/* Connection status */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-[11px] text-gray-500">
              {isConnected ? "Live" : "Disconnected"}
            </span>

            {!isConnected && (
              <button
                onClick={handleReconnect}
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                Reconnect
              </button>
            )}
            <button
              onClick={fetchConversations}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {wsError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-red-500" />
            <p className="text-xs text-red-600">{wsError}</p>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Conversation list */}
        <div
          className={`
            ${mobileView === "list" ? "flex" : "hidden"}
            md:flex md:w-80 lg:w-96 flex-col border-r border-gray-200 bg-white h-full
          `}
        >
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversation}
            onSelect={handleSelectConversation}
            loading={loading}
            onRefresh={fetchConversations}
          />
        </div>

        {/* Chat window */}
        <div
          className={`
            flex-1 flex flex-col bg-gray-50 min-h-0
            ${mobileView === "chat" ? "flex" : "hidden md:flex"}
          `}
        >
          <ChatWindow
            conversation={selectedConversationData}
            messages={currentMessages}
            setMessages={setCurrentMessages}
            onBack={handleBackToList}
            onMessageSent={handleMessageSent}
          />
        </div>
      </div>
    </div>
  );
}