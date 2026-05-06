import MessageBox from "@/components/MessageBox";
import Sidebar from "@/components/Sidebar";
import { userConversation } from "@/zustand/userConversation";
import React from "react";

const Home = () => {
  const { selectedConversation } = userConversation();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <img
        src="https://plus.unsplash.com/premium_photo-1681487683141-e72c5ccd94e6?q=80&w=2070&auto=format&fit=crop"
        className="absolute inset-0 w-full h-full object-cover blur-sm"
      />

      <div className="relative z-10 w-full h-full p-2 md:p-6">
        <div className="w-full h-full max-w-6xl mx-auto md:flex gap-4">

          <div
            className={`
              h-full md:block
              ${selectedConversation ? "hidden md:block md:w-[320px]" : "block md:w-[320px]"}
            `}
          >
            <Sidebar />
          </div>

          <div
            className={`
              h-full flex-1
              ${selectedConversation ? "block" : "hidden md:block"}
            `}
          >
            <div className="w-full h-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl">
              <MessageBox />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;