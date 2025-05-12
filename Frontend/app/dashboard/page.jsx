"use client";
import React, { useReducer } from "react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const page = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="flex flex-col items-center p-6 h-screen">
      <div className="flex max-h-0 ">
        <h1 className="text-4xl text-amber-400">Dashboard </h1>
      </div>
    </div>
  );
};

export default page;
