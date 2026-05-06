import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical } from "lucide-react";

const Profile = () => {
  const { authData, setAuthData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("chatapp");
    setAuthData(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <MoreVertical size={18} />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate("/")}>
              Home
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-500"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center justify-center flex-1 px-4">

        <div className="bg-white w-full max-w-sm rounded-2xl shadow-sm p-6 text-center">

          {/* Avatar */}
          <img
            src={authData?.profilePic}
            alt="profile"
            className="w-20 h-20 rounded-full mx-auto mb-4 border"
          />

          {/* Name */}
          <h2 className="text-lg font-semibold">
            {authData?.fullname || authData?.username}
          </h2>

          {/* Username */}
          <p className="text-gray-500 text-sm">
            @{authData?.username}
          </p>

          

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-500 hover:scale-110 duration-500 text-white py-2 rounded-lg  transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;