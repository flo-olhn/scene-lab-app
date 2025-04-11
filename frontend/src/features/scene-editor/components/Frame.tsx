import React from 'react';
import {SelectIndicator} from "./SelectIndicator";

interface FrameProps {
  element: {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
    content?: React.ReactNode;
  };
  selected: boolean;
}

const Frame: React.FC<FrameProps> = ({ element, selected }) => {
  return (
    <div
      id={`d_${element.id}`}
      className="absolute rounded-xl flex items-center justify-center transition-colors"
      style={{
        left: `${element.x}px`,
          top: `${element.y}px`,
          width: `${element.width}px`,
          height: `${element.height}px`,
          backgroundColor: element.color || "transparent",
          outline: selected ? "1px solid oklch(62.3% 0.214 259.815)" : "none",
          cursor: "move",
          color: "white",
          zIndex: selected ? 10 : 1,
      }}
    >
  <style jsx>{`
        #d_${element.id}::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 10px;
          border: 2px solid transparent;
          background: linear-gradient(
              45deg,
              #ff00ff,
              #00ffff,
              #00ff00,
              #ffff00,
              #ff0000,
              #ff00ff
            )
            border-box;
          background-size: 500% 500%;
          animation: gradientAnimation 5s ease infinite;
          mask: linear-gradient(0, #ffffff, #000) content-box,
            linear-gradient(0, #fff, #000);
          mask-composite: exclude;
        }

        @keyframes gradientAnimation {
          0% {
            background-position: 0 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0 50%;
          }
        }
      `}</style>

  {element.content}
  {selected && (
    <>
      <div
        className="absolute -bottom-0 -right-0 text-xs text-black bg-white bg-opacity-70 px-1"
      >
      {element.x.toFixed(0)},{element.y.toFixed(0)}
    </div>
    <SelectIndicator />
    </>
  )}
  </div>
);
};

export default Frame;