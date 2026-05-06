import { create } from "zustand";

export const userConversation = create((set, get) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation }),
  messages: [],
  setMessages: (messages) =>
    set({
      messages:
        typeof messages === "function"
          ? messages(get().messages)
          : Array.isArray(messages)
            ? messages
            : [],
    }),
}));
