import { useState, useCallback } from "react";
import type { Chat, ChatMessage, BookmarkedMessage, Folder, InterfaceMode, ThoughtEntry } from "@/types/chat";

const DEMO_CHATS: Chat[] = [
  {
    id: "1",
    title: "TCGA-BRCA outcomes",
    messages: [],
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: "2",
    title: "RNA-seq Analysis",
    messages: [],
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172800000),
  },
  {
    id: "3",
    title: "Gene enrichment",
    messages: [],
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 259200000),
  },
  {
    id: "4",
    title: "TP53 Mutation Impact Analysis",
    messages: [],
    createdAt: new Date(Date.now() - 345600000),
    updatedAt: new Date(Date.now() - 345600000),
  },
  {
    id: "5",
    title: "BRCA1 Functional Annotation",
    messages: [],
    createdAt: new Date(Date.now() - 432000000),
    updatedAt: new Date(Date.now() - 432000000),
  },
];

const DEMO_FOLDERS: Folder[] = [
  {
    id: "f1",
    name: "Pan-Cancer RNA-seq Expression Atlas",
    chatIds: ["1", "2"],
    datasetCount: 12,
    updatedAt: new Date(Date.now() - 7200000),
  },
  {
    id: "f2",
    name: "CRISPR Screen Analysis — Drug Resistance",
    chatIds: ["3"],
    datasetCount: 4,
    updatedAt: new Date(Date.now() - 18000000),
  },
];

export function useChatStore() {
  const [chats, setChats] = useState<Chat[]>(DEMO_CHATS);
  const [folders, setFolders] = useState<Folder[]>(DEMO_FOLDERS);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [mode, setMode] = useState<InterfaceMode>("conversation");
  const [bookmarkedMessages, setBookmarkedMessages] = useState<BookmarkedMessage[]>([]);

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;

  const createChat = useCallback((options?: { title?: string; messages?: Omit<ChatMessage, "id" | "timestamp">[] }) => {
    const now = new Date();
    const messages: ChatMessage[] = (options?.messages || []).map((m) => ({
      ...m,
      id: crypto.randomUUID(),
      timestamp: now,
    }));
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: options?.title || "New Chat",
      messages,
      createdAt: now,
      updatedAt: now,
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    return newChat;
  }, []);

  const renameChat = useCallback((chatId: string, newTitle: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, title: newTitle } : c))
    );
  }, []);

  const addMessage = useCallback(
    (chatId: string, message: Omit<ChatMessage, "id" | "timestamp">) => {
      const msg: ChatMessage = {
        ...message,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? { ...c, messages: [...c.messages, msg], updatedAt: new Date() }
            : c
        )
      );
      return msg;
    },
    []
  );

  const removeMessage = useCallback((chatId: string, messageId: string) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, messages: c.messages.filter((m) => m.id !== messageId) }
          : c
      )
    );
  }, []);

  const updateMessageMetadata = useCallback(
    (chatId: string, messageId: string, metadata: ChatMessage["metadata"]) => {
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === messageId ? { ...m, metadata } : m
                ),
              }
            : c
        )
      );
    },
    []
  );

  const updateExecutionStep = useCallback(
    (chatId: string, messageId: string, stepId: string, status: "pending" | "running" | "complete", duration?: string) => {
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === messageId && m.metadata?.executionSteps
                    ? {
                        ...m,
                        metadata: {
                          ...m.metadata,
                          executionSteps: m.metadata.executionSteps.map((s) =>
                            s.id === stepId ? { ...s, status, duration } : s
                          ),
                        },
                      }
                    : m
                ),
              }
            : c
        )
      );
    },
    []
  );

  const addThoughtEntry = useCallback(
    (chatId: string, messageId: string, entry: ThoughtEntry) => {
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === messageId && m.metadata
                    ? {
                        ...m,
                        metadata: {
                          ...m.metadata,
                          thoughtProcess: [...(m.metadata.thoughtProcess || []), entry],
                        },
                      }
                    : m
                ),
              }
            : c
        )
      );
    },
    []
  );

  const branchChat = useCallback(
    (chatId: string, atMessageIndex: number) => {
      const source = chats.find((c) => c.id === chatId);
      if (!source) return null;
      const branched: Chat = {
        id: crypto.randomUUID(),
        title: `${source.title} (branch)`,
        messages: source.messages.slice(0, atMessageIndex + 1),
        createdAt: new Date(),
        updatedAt: new Date(),
        parentId: chatId,
      };
      setChats((prev) => [branched, ...prev]);
      setActiveChatId(branched.id);
      return branched;
    },
    [chats]
  );

  const toggleBookmark = useCallback(
    (chatId: string, messageId: string) => {
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === messageId ? { ...m, bookmarked: !m.bookmarked } : m
                ),
              }
            : c
        )
      );

      setBookmarkedMessages((prev) => {
        const exists = prev.find((b) => b.messageId === messageId);
        if (exists) {
          return prev.filter((b) => b.messageId !== messageId);
        }
        const chat = chats.find((c) => c.id === chatId);
        const message = chat?.messages.find((m) => m.id === messageId);
        if (!chat || !message) return prev;
        return [
          {
            messageId,
            chatId,
            chatTitle: chat.title,
            content: message.content,
            bookmarkedAt: new Date(),
          },
          ...prev,
        ];
      });
    },
    [chats]
  );

  return {
    chats,
    folders,
    activeChatId,
    activeChat,
    mode,
    bookmarkedMessages,
    setMode,
    setActiveChatId,
    createChat,
    renameChat,
    addMessage,
    removeMessage,
    updateMessageMetadata,
    updateExecutionStep,
    addThoughtEntry,
    branchChat,
    toggleBookmark,
  };
}
