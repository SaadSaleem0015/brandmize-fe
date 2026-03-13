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
const RECONNECT_BASE_DELAY_MS  = 3_000;
const RECONNECT_MAX_DELAY_MS   = 30_000;


function transformConversation(conv: any): Conversation {
  return {
    id: conv.id,
    participant: {
      id: conv.participant_id ?? conv.id,
      name: conv.participant_name ?? "Unknown",
      username: conv.participant_username ?? "",
      profile_picture_url:
        conv.profile_picture_url ??
        `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.participant_name ?? "User")}&background=7032e5&color=fff`,
      channel: conv.channel ?? "messenger",
    },
    last_message_preview: conv.last_message_preview ?? "",
    last_message_at: conv.last_message_at ?? new Date().toISOString(),
    unread_count: conv.unread_count ?? 0,
    channel: conv.channel ?? "messenger",
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
  const [wsError, setWsError]         = useState<string | null>(null);

  const { conversationId } = useParams();
  const navigate           = useNavigate();

  // Refs that WebSocket callbacks read – avoids stale closures
  const wsRef                  = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef    = useRef<ReturnType<typeof setTimeout>>();
  const reconnectAttempts      = useRef(0);
  const activeConversationRef  = useRef<number | null>(null);

  // FIX: keep a live ref to conversations so WS handlers never see stale state
  const conversationsRef = useRef<Conversation[]>([]);
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // ---------------------------------------------------------------------------
  // WebSocket helpers
  // ---------------------------------------------------------------------------
  const sendWsMessage = useCallback((payload: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  // FIX: handlers defined once, read state through ref to avoid stale closure
  const handleNewMessage = useCallback(
    (conversationId: number, newMessage: Message) => {
      const isCustomer = newMessage.sender === "customer";

      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.id !== conversationId) return conv;
          return {
            ...conv,
            last_message_preview: newMessage.content,
            // timestamp is Unix ms (number) → convert to ISO for Conversation.last_message_at
            last_message_at: new Date(newMessage.timestamp).toISOString(),
            unread_count:
              isCustomer && activeConversationRef.current !== conversationId
                ? conv.unread_count + 1
                : conv.unread_count,
          };
        });
        return sortByLatest(updated);
      });

      if (isCustomer && activeConversationRef.current !== conversationId) {
        const conv = conversationsRef.current.find((c) => c.id === conversationId);
        if (conv) {
          notifyResponse(
            null,
            `New message from ${conv.participant.name}`,
            ""
          );
        }
      }
    },
    []
  );

  const handleConversationUpdate = useCallback(
    (update: ConversationUpdatePayload) => {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== update.id) return conv;
          return {
            ...conv,
            ...(update.last_message_preview !== undefined && {
              last_message_preview: update.last_message_preview,
            }),
            ...(update.last_message_at !== undefined && {
              last_message_at: update.last_message_at,
            }),
            ...(update.unread_count !== undefined && {
              unread_count: update.unread_count,
            }),
          };
        })
      );
    },
    []
  );

 
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/omni/conversations");
      if (response.data) {
        setConversations(sortByLatest(response.data.map(transformConversation)));
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      notifyResponse(error, "", "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, []);


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

    // Close stale socket before opening a new one
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.onclose = null; // prevent triggering reconnect loop
      wsRef.current.close();
    }

    const ws = new WebSocket(
      `ws://localhost:8000/api/v1/omni/ws/dashboard?token=${token}`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setWsError(null);
      // FIX: reset counter on successful connect so future drops get fresh attempts
      reconnectAttempts.current = 0;

      // Re-open the active chat if the WS reconnected mid-session
      if (activeConversationRef.current) {
        sendWsMessage({ event: "open_chat", conversation_id: activeConversationRef.current });
      }
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketEvent = JSON.parse(event.data);

        switch (data.event) {
          case "new_message":
            if (data.conversation_id != null && data.message) {
              handleNewMessage(data.conversation_id, data.message);
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
            break;

          case "error":
            console.error("WebSocket server error:", data);
            setWsError("Connection error occurred");
            break;
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.onerror = () => {
      setIsConnected(false);
      setWsError("Connection error. Retrying…");
    };

    ws.onclose = () => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleNewMessage, handleConversationUpdate, sendWsMessage]);

 
  useEffect(() => {
    fetchConversations();
    connectWebSocket();

    return () => {
      if (activeConversationRef.current) {
        sendWsMessage({ event: "close_chat" });
      }
      // Detach onclose so the unmount close doesn't trigger a reconnect
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
      clearTimeout(reconnectTimeoutRef.current);
    };
  }, []); // intentionally empty – run once on mount

  // ---------------------------------------------------------------------------
  // URL param → select conversation
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!conversationId) return;

    const id = parseInt(conversationId, 10);
    if (isNaN(id)) return;

    setSelectedConversation(id);
    setMobileView("chat");

    if (activeConversationRef.current !== null && activeConversationRef.current !== id) {
      sendWsMessage({ event: "close_chat" });
    }

    activeConversationRef.current = id;
    sendWsMessage({ event: "open_chat", conversation_id: id });
    markAsRead(id);
  }, [conversationId]); // sendWsMessage is stable, omit to keep dep array minimal

  
  const markAsRead = useCallback(async (convId: number) => {
    try {
      await api.post(`/omni/conversations/${convId}/mark-read`);
      // Optimistic local update – the WS event from the server will confirm
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c))
      );
    } catch (error) {
      console.error("Error marking conversation as read:", error);
    }
  }, []);


  const handleSelectConversation = useCallback(
    (id: number) => {
      if (activeConversationRef.current !== null && activeConversationRef.current !== id) {
        sendWsMessage({ event: "close_chat" });
      }

      activeConversationRef.current = id;
      sendWsMessage({ event: "open_chat", conversation_id: id });
      setSelectedConversation(id);
      setMobileView("chat");
      navigate(`/inbox/${id}`);
      markAsRead(id);
    },
    [navigate, sendWsMessage, markAsRead]
  );

  const handleBackToList = useCallback(() => {
    if (activeConversationRef.current) {
      sendWsMessage({ event: "close_chat" });
      activeConversationRef.current = null;
    }
    setMobileView("list");
    navigate("/inbox");
  }, [navigate, sendWsMessage]);

  const handleReconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    clearTimeout(reconnectTimeoutRef.current);
    connectWebSocket();
  }, [connectWebSocket]);


  const handleMessageSent = useCallback(() => {
   
  }, []);

 
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
            onBack={handleBackToList}
            onMessageSent={handleMessageSent}
          />
        </div>
      </div>
    </div>
  );
}