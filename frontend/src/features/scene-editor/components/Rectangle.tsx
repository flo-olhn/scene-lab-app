import React from "react";
import {SelectIndicator} from "./SelectIndicator";

interface RectangleProps {
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

const Rectangle: React.FC<RectangleProps> = ({ element, selected }) => {
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
        zIndex: selected ? 10 : 1,
      }}
    >
      {element.content}
      {selected && (
        <>
          <div className="absolute -bottom-0 -right-0 text-xs bg-white bg-opacity-70 px-1">
            {element.x.toFixed(0)},{element.y.toFixed(0)}
          </div>
          <SelectIndicator />
        </>
      )}
    </div>
  );
};

export default Rectangle;