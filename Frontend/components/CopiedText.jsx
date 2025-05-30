import React from "react";
import { FaCopy } from "react-icons/fa";

const CopiedText = ({ item }) => {
  const handleCopyClick = () => {
    try {
      navigator.clipboard.writeText(item);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };
  return (
    <div className="flex justify-between items-center p-2 ">
      <span className="w-9/10">{item}</span>
      <FaCopy
        onClick={handleCopyClick}
        className="text-blue-500 hover:text-amber-300 cursor-pointer"
      />
    </div>
  );
};

export default CopiedText;
