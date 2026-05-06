import { useAuth } from "@/context/AuthContext";
import { userConversation } from "@/zustand/userConversation";
import axios from "axios";
import { Loader2, UserCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { CiLogout } from "react-icons/ci";
import { FaSearch } from "react-icons/fa";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSocketContext } from "@/context/SocketContext";

const Sidebar = () => {
  const { authData, setAuthData } = useAuth();
  const { userOnline, socket } = useSocketContext();
  const navigate = useNavigate();

  const [searchData, setSearchData] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatUser, setChatUser] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [unreadCount, setUnreadCount] = useState({});

  const { setSelectedConversation } = userConversation();

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3001/api/v1/message/unread/count",
        { withCredentials: true },
      );
      if (res.data.success) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", () => {
      fetchUnreadCount();
    });

    return () => socket.off("newMessage");
  }, [socket]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3001/api/v1/user/search?search=${searchData}`,
        { withCredentials: true },
      );
      if (res.data.success) {
        setResults(res.data.users || []);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleChatUser = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          "http://localhost:3001/api/v1/user/currentchatter",
          { withCredentials: true },
        );
        if (res.data.success) {
          setChatUser(res.data.data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    handleChatUser();
  }, []);

  const handelUserClick = (user) => {
    const id = user._id || user.id;
    setSelectedUserId(id);
    setSelectedConversation(user);
    setUnreadCount((prev) => ({ ...prev, [id]: 0 }));
  };

  const handleLogout = async () => {
    try {
      const logout = await axios.post(
        "http://localhost:3001/api/v1/auth/logout",
      );
      if (logout.data.success) {
        localStorage.removeItem("chatapp");
        setAuthData([]);
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full md:w-[320px] h-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-4 flex flex-col">
      {/* Search */}
      <div className="flex items-center gap-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
            value={searchData}
            onChange={(e) => setSearchData(e.target.value)}
            placeholder="Search..."
            className="w-full p-3 rounded-2xl border outline-none bg-white"
          />
          <button className="absolute top-2 right-2 bg-blue-500 p-2 rounded-full">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <FaSearch className="text-white" />
            )}
          </button>
        </form>

        <div
          onClick={() => navigate(`/profile/${authData?.id}`)}
          className="cursor-pointer shrink-0"
        >
          {authData?.profilePic ? (
            <img
              src={authData.profilePic}
              alt=""
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <UserCircle className="w-11 h-11" />
          )}
        </div>
      </div>

      <hr className="border-gray-400" />

      <div className="flex-1 overflow-y-auto mt-3 pb-14">
        {searchData?.length > 0 ? (
          <>
            {results.length > 0 ? (
              results.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handelUserClick(user)}
                  className="m-2 flex gap-3 bg-gray-200 rounded-3xl p-3 cursor-pointer"
                >
                  <div className="relative shrink-0">
                    <img
                      src={user.profilePic}
                      alt=""
                      className="w-12 h-12 rounded-full"
                    />
                    {userOnline.includes(user._id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className="font-semibold">{user.fullname}</h1>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No users found</p>
            )}

            <button
              onClick={() => {
                setSearchData("");
                setResults([]);
              }}
              className="absolute bottom-3 left-4 bg-gray-200 p-2 rounded-full flex items-center gap-1"
            >
              <HiArrowNarrowLeft />
              Back
            </button>
          </>
        ) : (
          <>
            {chatUser?.length === 0 ? (
              <div className="flex flex-col items-center mt-10">
                <h1 className="text-xl font-semibold">Search Friends</h1>
                <p className="text-sm text-gray-700">
                  Start chat with your friends
                </p>
              </div>
            ) : (
              <>
                {chatUser.map((user) => {
                  const id = user._id || user.id;
                  const count = unreadCount[id] || 0; // ✅ unread count

                  return (
                    <div
                      key={id}
                      onClick={() => handelUserClick(user)}
                      className={`m-2 p-3 rounded-3xl cursor-pointer ${
                        selectedUserId === id
                          ? "bg-sky-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={user.profilePic}
                            alt=""
                            className="w-12 h-12 rounded-full"
                          />
                          {userOnline.includes(id) && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <h1 className="font-semibold truncate flex-1">
                          {user.fullname}
                        </h1>
                        {/* ✅ Unread badge */}
                        {count > 0 && (
                          <span className="bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                            {count > 9 ? "9+" : count}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={handleLogout}
                  className="absolute bottom-3 left-4 bg-gray-200 p-2 rounded-full flex items-center gap-1"
                >
                  <CiLogout />
                  Logout
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
