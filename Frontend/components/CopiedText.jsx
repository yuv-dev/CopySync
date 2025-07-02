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
    <div className="flex justify-between items-center p-2 w-full ">
      <span className="w-11/12 flex-grow break-all ">{item}</span>
      <FaCopy
        onClick={handleCopyClick}
        className=" ml-8 text-blue-500 hover:text-amber-300 cursor-pointer shrink-0"
      />
    </div>
  );
};

export default CopiedText;
