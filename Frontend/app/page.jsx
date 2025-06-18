"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Home() {
  const { login, user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLoginSuccess = async (response) => {
    try {
      console.log("Login successful:", response);
      await login(response.credential);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="mb-6 text-4xl font-bold">
        <span className=" text-blue-600">Clipboard</span>
        <span className=" text-gray-800">Sync</span>
      </h1>
      <p className="text-lg mb-4">
        Sync your clipboard across devices with ease.
      </p>
      {user ? (
        <>
        <p className="text-amber-400 mb-4">Welcome back, {user.name}!</p>
        <p> Redirecting to DashBoard  </p>
        </>
      ) : (
        <GoogleLogin
          clientId={process.env.GOOGLE_CLIENT_ID}
          buttonText="Login with Google"
          onSuccess={handleLoginSuccess}
          onFailure={(error) => console.error("Login failed:", error)}
          cookiePolicy={"single_host_origin"}
        />
      )}
    </div>
  );
}
