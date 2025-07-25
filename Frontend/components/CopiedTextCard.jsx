import React from "react";
import { FaCopy, FaInfo } from "react-icons/fa";

const CopiedTextCard = ({ item }) => {
  const handleCopyClick = () => {
    try {
      navigator.clipboard.writeText(item.content);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };
  return (
    <div className=" w-full group cursor-pointer">
      <div className="hidden group-hover:flex text-sm font-bold text-amber-600 bg-black px-4 py-1 rounded rounded-b-none items-center justify-around">
        <span>{item.deviceId}</span>
        <span>{item.createdAt}</span>
      </div>
      <div className="flex justify-between items-center p-4 w-full ">
        <span className="w-10/12 flex-grow break-all ">{item.content}</span>
        <FaCopy
          onClick={handleCopyClick}
          className=" ml-8 text-blue-500 hover:text-amber-300 cursor-pointer shrink-0"
        />
      </div>
    </div>
  );
};

export default CopiedTextCard;
