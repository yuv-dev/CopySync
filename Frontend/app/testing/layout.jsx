import Navbar from "@/components/Navbar";
import React from "react";

const layout = ({ children }) => {
  return (
    <div className="box-border bg-black">
      <Navbar />
      {children}
    </div>
  );
};

export default layout;
