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

const Login = () => {
    const url = `https://chatapp-2eab.onrender.com`;

  const { setAuthData } = useAuth();
  const navigate = useNavigate();
  const [inputData, setInputData] = useState({});
  const [loading, setLoading] = useState(false);

  // HandleInput
  const handleInput = (e) => {
    setInputData({
      ...inputData,
      [e.target.id]: e.target.value,
    });
  };

  // handleSubmit
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const res = await axios.post(
        `${url}/api/v1/auth/login`,
        inputData,
        {
          withCredentials: true,
        },
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setAuthData(res.data);
        localStorage.setItem("chatapp", JSON.stringify(res.data));
        navigate("/");
      }
    } catch (error) {
    console.log("Full error:", error);    
    console.log("Status:", error?.response?.status); 
    console.log("Message:", error?.response?.data); 
    toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="relative w-full h-screen">
          <img
            src="https://plus.unsplash.com/premium_photo-1681487683141-e72c5ccd94e6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            className="absolute inset-0 w-full h-full object-center  blur-sm"
          />
          <div className="relative z-10 text-white p-4 flex justify-center items-center w-full h-full select-none">
            <Card className="w-full max-w-sm bg-transparent shadow-2xl shadow-black  ">
              <CardHeader>
                <CardTitle className="text-3xl text-center text-black font-bold mb-2">
                  Login <span className="text-red-600">Chatters</span>
                </CardTitle>
                <CardDescription className="text-center text-gray-900">
                  Enter your email below to login to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
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
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        to={"/forget-password"}
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-red-600"
                      >
                        Forgot your password?
                      </Link>
                    </div>

                    <Input
                      id="password"
                      onChange={handleInput}
                      type="password"
                      required
                      className="focus-visible:ring-black focus-visible:ring-1"
                      placeholder="Xyz1234@"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2 bg-transparent">
                <Button type="submit" className="w-full active:scale-105">
                  {loading ? <Loader2 className="animate-spin" /> : "Login"}
                </Button>
                <div>
                  <p>
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className="text-red-600  hover:underline"
                    >
                      Register Now!!
                    </Link>{" "}
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </>
  );
};

export default Login;
