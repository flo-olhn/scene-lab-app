import React from 'react';
import Image from "next/image";

export const LeftPanel: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-64 h-full flex flex-col bg-stone-900/90 border-r border-stone-700 text-white backdrop-blur-xl">
      {/* Elements */}
      <div className={"w-full h-full"}>
      </div>
      {/* Toolbox */}
      <div className={"w-full h-fit grid grid-cols-4 gap-4 p-4 border-t-1 border-stone-700 place-content-between"}>
        <div className={"w-10 h-10 border flex items-center justify-center rounded border-stone-600 hover:bg-stone-700 hover:cursor-pointer"}>
          <Image
            src="/icons/Rectangle.png"
            width={24}
            height={24}
            alt="Rectangle"
            priority
            />
        </div>
        <div className={"w-10 h-10 border flex items-center justify-center rounded border-stone-700 hover:bg-stone-700 hover:cursor-pointer"}>
          <Image
            src="/icons/Frame.png"
            width={26}
            height={26}
            alt="Rectangle"
            priority
          />
        </div>
      </div>
    </div>
  );
};