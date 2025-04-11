// ElementRenderer.tsx
import React from "react";
import Frame from "./Frame";
import Rectangle from "./Rectangle";
// import other components like Text, Circle, etc.

interface Element {
  id: number;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  content?: React.ReactNode;
}

interface ElementRendererProps {
  element: Element;
  selectedElementId: number | null;
}

const ElementRenderer: React.FC<ElementRendererProps> = ({ element, selectedElementId }) => {
  const isSelected = selectedElementId === element.id;

  switch (element.type) {
    case "frame":
      return <Frame element={element} selected={isSelected} />;
    case "rectangle":
      return <Rectangle element={element} selected={isSelected} />;
    // Add additional cases for "text", "circle", etc.
    default:
      return null;
  }
};

export default ElementRenderer;
