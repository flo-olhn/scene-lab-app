import React from "react";

export const SelectIndicator: React.FC = () => {
  return (
    <>
      <div className={`absolute w-full h-[2px] bg-blue-500 -top-[2px]`}></div>
      <div className="absolute w-full h-[2px] bg-blue-500 -bottom-[2px]"></div>
      <div className="absolute w-[2px] h-full bg-blue-500 -left-[2px]"></div>
      <div className="absolute w-[2px] h-full bg-blue-500 -right-[2px]"></div>
      <div className="absolute w-2 h-2 border-2 border-blue-500 bg-white rounded-full -top-[5px] -left-[5px]"></div>
      <div className="absolute w-2 h-2 border-2 border-blue-500 bg-white rounded-full -top-[5px] -right-[5px]"></div>
      <div className="absolute w-2 h-2 border-2 border-blue-500 bg-white rounded-full -bottom-[5px] -right-[5px]"></div>
      <div className="absolute w-2 h-2 border-2 border-blue-500 bg-white rounded-full -bottom-[5px] -left-[5px]"></div>
    </>
  );
};