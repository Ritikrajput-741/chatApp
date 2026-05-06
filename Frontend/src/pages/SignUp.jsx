import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const SignUp = () => {
  const url = "https://chatapp-2eab.onrender";

  const { setAuthData, authData } = useAuth();
  const navigate = useNavigate();
  const [inputData, setInputData] = useState({});
  const [loading, setLoading] = useState(false);

  /*    HandleInput    */
  const handleInput = (e) => {
    setInputData({
      ...inputData,
      [e.target.id]: e.target.value,
    });
  };

  /*   handleSubmit    */
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const res = await axios.post(`${url}/api/v1/auth/register`, inputData);
      if (res.data.success) {
        toast.success(res.data.message);
        setAuthData(res.data);
        console.log("signup", res.data);

        localStorage.setItem("chatapp", JSON.stringify(res.data));
        navigate("/login");
      }
    } catch (error) {
      console.log("Full error:", error);
      console.log("Status:", error?.response?.status);
      console.log("Message:", error?.response?.data);
      toast.error(error?.response?.data?.message || "Something went wrong");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative w-full h-screen">
        <img
          src="https://plus.unsplash.com/premium_photo-1681487683141-e72c5ccd94e6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          className="absolute inset-0 w-full h-full object-center  blur-sm"
        />
        <div className="relative z-10 text-white p-4 flex justify-center items-center w-full h-full select-none">
          <Card className="w-full max-w-sm bg-transparent shadow-2xl shadow-black  ">
            <CardHeader>
              <CardTitle className="text-3xl text-center text-black font-bold mb-2">
                SignUp <span className="text-red-600">Chatters</span>
              </CardTitle>
              <CardDescription className="text-center text-gray-900">
                Enter your details below to register new account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                {/* Fullname */}
                <div className="grid gap-2">
                  <Label htmlFor="fullname">Fullname</Label>
                  <Input
                    id="fullname"
                    onChange={handleInput}
                    type="text"
                    placeholder="John alex"
                    required
                    className="focus-visible:ring-black focus-visible:ring-1"
                  />
                </div>

                {/* Username */}
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    onChange={handleInput}
                    type="text"
                    placeholder="Alex_123"
                    required
                    className="focus-visible:ring-black focus-visible:ring-1"
                  />
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    onChange={handleInput}
                    type="email"
                    placeholder="m@example.com"
                    required
                    className="focus-visible:ring-black focus-visible:ring-1"
                  />

                  {/* Gender */}
                </div>
                <div
                  id="gender"
                  onChange={handleInput}
                  className="flex flex-col gap-2"
                >
                  <Label htmlFor="gender">Gender</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="gender"
                        value="male"
                        onChange={(e) =>
                          setInputData({ ...inputData, gender: e.target.value })
                        }
                      />
                      Male
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="gender"
                        value="female"
                        onChange={(e) =>
                          setInputData({ ...inputData, gender: e.target.value })
                        }
                      />
                      Female
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="gender"
                        value="other"
                        onChange={(e) =>
                          setInputData({ ...inputData, gender: e.target.value })
                        }
                      />
                      Other
                    </label>
                  </div>
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    onChange={handleInput}
                    type="password"
                    required
                    className="focus-visible:ring-black focus-visible:ring-1"
                    placeholder="Xyz1234@"
                  />
                </div>

                {/* Confirm Password */}
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confrim Password</Label>
                  <Input
                    id="confirmPassword"
                    onChange={handleInput}
                    type="text"
                    required
                    className="focus-visible:ring-black focus-visible:ring-1"
                    placeholder="Xyz1234@"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 bg-transparent">
              <Button
                onClick={handleSubmit}
                className="w-full active:scale-105"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Signup"}
              </Button>
              <div>
                <p>
                  Already have an account?{" "}
                  <Link to="/login" className="text-red-600  hover:underline">
                    Login
                  </Link>{" "}
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SignUp;
