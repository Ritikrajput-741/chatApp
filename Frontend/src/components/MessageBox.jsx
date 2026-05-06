import { useAuth } from "@/context/AuthContext";
import { userConversation } from "@/zustand/userConversation";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { TiMessages } from "react-icons/ti";
import { IoSend } from "react-icons/io5";
import { FaAngleLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import notify from "../assets/message_tone.mp3";
import { useSocketContext } from "@/context/SocketContext";

const MessageBox = () => {
  const navigate = useNavigate();
  const { socket, userOnline } = useSocketContext();
  const {
    selectedConversation,
    setSelectedConversation,
    messages,
    setMessages,
  } = userConversation();
  const { authData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false); // ✅ typing state
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null); // ✅ timeout ref

  /* Message seen/unseen */
  useEffect(() => {
    const markMessagesSeen = async () => {
      if (!messages || !Array.isArray(messages)) return;

      const unseenMessages = messages.filter(
        (msg) =>
          msg.reciverId?.toString() === authData?.id?.toString() && !msg.seen,
      );

      for (const msg of unseenMessages) {
        try {
          await axios.put(
            `/api/v1/message/seen/${msg._id}`,
            {},
            { withCredentials: true },
          );
        } catch (error) {
          console.log(error);
        }
      }
    };

    markMessagesSeen();
  }, [selectedConversation?._id]);

  /* Socket - messageSeen */
  useEffect(() => {
    if (!socket) return;

    socket.on("messageSeen", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, seen: true } : msg,
        ),
      );
    });

    return () => socket.off("messageSeen");
  }, [socket]);

  /* Socket - newMessage */
  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== authData?.id) {
        const sound = new Audio(notify);
        sound.play();
      }
      setMessages((prev) => {
        const prevMessages = Array.isArray(prev) ? prev : [];
        return [...prevMessages, newMessage];
      });
    });
    return () => socket.off("newMessage");
  }, [socket]);

  /* ✅ Socket - typing indicator listen */
  useEffect(() => {
    if (!socket) return;

    socket.on("typing", () => {
      setIsTyping(true);
    });

    socket.on("stopTyping", () => {
      setIsTyping(false);
    });

    return () => {
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [socket]);

  /* Fetch messages */
  useEffect(() => {
    const getMessage = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `/api/v1/message/${selectedConversation?._id}`,
          { withCredentials: true },
        );
        setMessages(Array.isArray(res.data.message) ? res.data.message : []);
      } catch (error) {
        console.log(error?.response?.data?.message || "Something went wrong");
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedConversation?._id) getMessage();
  }, [selectedConversation?._id]);

  /* Auto scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* Send message */
  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);

    // ✅ Stop typing emit
    socket.emit("stopTyping", {
      senderId: authData?.id,
      receiverId: selectedConversation?._id,
    });

    try {
      const res = await axios.post(
        `/api/v1/message/send/${selectedConversation?._id}`,
        { messages: input },
        { withCredentials: true },
      );
      if (res.data.success) {
        setMessages((prev) => {
          const prevMessages = Array.isArray(prev) ? prev : [];
          return [...prevMessages, res.data.newMessage];
        });
        setInput("");
      }
    } catch (error) {
      console.log(error?.response?.data?.message || "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  /* ✅ Typing handler */
  const handleTyping = (e) => {
    setInput(e.target.value);

    if (!socket) return;

    // Typing emit karo
    socket.emit("typing", {
      senderId: authData?.id,
      receiverId: selectedConversation?._id,
    });

    // Pehla timeout clear karo
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // 2 second baad stopTyping emit karo
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        senderId: authData?.id,
        receiverId: selectedConversation?._id,
      });
    }, 2000);
  };

  /* Enter key */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  /* Format time */
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  /* Go prev */
  const goPrevPage = () => {
    setSelectedConversation(null);
  };

  if (selectedConversation === null) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
        <TiMessages className="w-14 h-14 text-gray-400" />
        <h1 className="capitalize font-bold text-2xl md:text-3xl text-gray-700">
          Welcome!! 👋 {authData?.username} 😎
        </h1>
        <p className="text-gray-500 text-sm">
          Select a friend to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="w-full bg-blue-500 flex gap-3 items-center px-4 py-3 shrink-0">
        <div
          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer self-center"
          onClick={goPrevPage}
        >
          <FaAngleLeft className="text-black" />
        </div>
        <div className="relative shrink-0">
          <img
            src={selectedConversation.profilePic}
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full object-cover"
          />
          {userOnline.includes(selectedConversation._id) && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-500 rounded-full" />
          )}
        </div>
        <div>
          <h1 className="capitalize text-base md:text-lg text-white font-bold leading-tight">
            {selectedConversation.fullname}
          </h1>
          {/* ✅ Typing indicator header mein */}
          {isTyping ? (
            <p className="text-blue-100 text-xs animate-pulse">typing...</p>
          ) : (
            <p className="text-blue-100 text-xs">
              @{selectedConversation.username}
            </p>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-2 bg-transparent">
        {loading && (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {!loading && messages?.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <p className="bg-white/80 px-5 py-3 rounded-xl text-gray-500 text-sm">
              No messages yet. Say hi! 👋
            </p>
          </div>
        )}

        {!loading &&
          messages?.length > 0 &&
          messages.map((msg) => {
            const isMine =
              msg.senderId === authData?._id ||
              msg.senderId === authData?.id ||
              msg.senderId?.toString() === authData?.id?.toString();

            return (
              <div
                key={msg._id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm shadow ${
                    isMine
                      ? "bg-green-300 rounded-br-sm"
                      : "bg-white rounded-bl-sm"
                  }`}
                >
                  <p className="break-words">{msg.messages}</p>
                  <p className="text-[10px] text-right text-gray-400 mt-1 flex items-center justify-end gap-1">
                    {formatTime(msg.createdAt)}
                    {isMine && (
                      <span
                        className={msg.seen ? "text-blue-500" : "text-gray-400"}
                      >
                        {msg.seen ? "✓✓" : "✓"}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}

        {/* ✅ Typing bubble */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-sm shadow text-sm text-gray-400 animate-pulse">
              typing...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="w-full bg-white border-t border-gray-200 px-3 py-2 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={handleTyping} // ✅ handleTyping use kiya
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 transition"
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition shrink-0"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <IoSend className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageBox;
