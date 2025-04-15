import React from "react";
import { SelectIndicator } from "../SelectIndicator";

interface TextProps {
  element: {
    id: number;
    x: number;
    y: number;
    width?: number;
    height?: number;
    fontSize?: number;
    color?: string;
    content?: React.ReactNode;
  };
  selected: boolean;
}

const Text: React.FC<TextProps> = ({ element, selected }) => {
  return (
    <div 
      id={`d_${element.id}`}
      className="absolute flex items-center justify-center"
      style={{
        color: element.color ?? "white",
        fontSize: `${element.fontSize ?? 14}px`,
        backgroundColor: "red",
        width: `${element.width}px`,
        height: `${element.height}px`,
        outline: selected ? "1px solid oklch(62.3% 0.214 259.815)" : "none",
        cursor: "move",
        zIndex: selected ? 10 : 1,
      }}
    >
      {element.content ?? "Text"}
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

export default Text;