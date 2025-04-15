import React, { useState, useRef, useEffect } from "react";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import ElementRenderer from "./ElementRenderer";

export const Canvas = () => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef(null);

  // Dimensions de la zone d'édition
  const editorWidth = 1280;
  const editorHeight = 720;

  // Ajout des Components éditables
  const [elements, setElements] = useState([
    {
      id: 1,
      type: "rectangle",
      x: 400,
      y: 100,
      width: 128,
      height: 72,
      color: "pink",
      content: "",
    },
    {
      id: 2,
      type: "frame",
      x: 480,
      y: 200,
      width: 256,
      height: 128,
      content: "Component 2",
    },
    {
      id: 3,
      type: "text",
      x: 300,
      y: 300,
      width: 300,
      height: 100,
      color: 'green',
      content: "My text",
    },
    {
      id: 4,
      type: "rectangle",
      x: 400,
      y: 400,
      width: 280,
      height: 280,
      color: "green",
      content: "",
    }
  ]);

  interface Element {
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize?: number;
  }

  // Gestion de la sélection
  const [selectedElementId, setSelectedElementId] = useState<number | null>(
    null
  );
  const [isMovingElement, setIsMovingElement] = useState(false);
  const [elementDragStart, setElementDragStart] = useState({ x: 0, y: 0 });
  //const [mousePosition, setMousePosition] = useState({ x: 0, y: 0, wsX: 0, wsY: 0 });

  // Centrer initialement la zone d'édition
  useEffect(() => {
    if (canvasRef.current && editorRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();

      // Calcul pour centrer l'éditeur dans le canvas
      const centerX = (canvasRect.width - editorWidth * scale) / 2;
      const centerY = (canvasRect.height - editorHeight * scale) / 2;

      setPosition({ x: centerX, y: centerY });
    }
  }, [canvasRef, editorRef, scale]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>): void => {
    e.preventDefault();
    const delta: number = e.deltaY;
    const zoomFactor: number = delta > 0 ? 0.9 : 1.1; // Facteur de zoom

    // Limite le zoom entre 0.1 et 5
    const newScale: number = Math.min(Math.max(scale * zoomFactor, 0.1), 5);

    // Position de la souris par rapport à la fenêtre
    if (!canvasRef.current) return;
    const rect: DOMRect = canvasRef.current.getBoundingClientRect();
    const mouseX: number = e.clientX - rect.left;
    const mouseY: number = e.clientY - rect.top;

    // Conversion des coordonnées actuelles
    const { workspaceX, workspaceY }: WorkspaceCoordinates =
      clientToWorkspaceCoordinates(e.clientX, e.clientY);

    // Calcul du nouveau décalage pour garder le point focal sous la souris
    const newPosX: number = mouseX - workspaceX * newScale;
    const newPosY: number = mouseY - workspaceY * newScale;

    setPosition({ x: newPosX, y: newPosY });
    setScale(newScale);
  };

  // Fonction pour convertir les coordonnées client en coordonnées de l'espace de travail
  interface WorkspaceCoordinates {
    workspaceX: number;
    workspaceY: number;
  }

  const clientToWorkspaceCoordinates = (
    clientX: number,
    clientY: number
  ): WorkspaceCoordinates => {
    if (!canvasRef.current) return { workspaceX: 0, workspaceY: 0 };

    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;

    // Conversion en tenant compte de la position et de l'échelle
    const workspaceX = (canvasX - position.x) / scale;
    const workspaceY = (canvasY - position.y) / scale;

    return { workspaceX, workspaceY };
  };

  const isPointInElement = (
    clientX: number,
    clientY: number,
    element: Element
  ): boolean => {
    const { workspaceX, workspaceY } = clientToWorkspaceCoordinates(
      clientX,
      clientY
    );

    return (
      workspaceX >= element.x &&
      workspaceX <= element.x + element.width &&
      workspaceY >= element.y &&
      workspaceY <= element.y + element.height
    );
  };

  interface ConstrainToEditorResult {
    x: number;
    y: number;
  }

  const constrainToEditor = (
    x: number,
    y: number,
    width: number,
    height: number
  ): ConstrainToEditorResult => {
    // Contraindre la position X
    const constrainedX = Math.max(0, Math.min(x, editorWidth - width));

    // Contraindre la position Y
    const constrainedY = Math.max(0, Math.min(y, editorHeight - height));

    return { x: constrainedX, y: constrainedY };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    // Mise à jour des coordonnées de la souris pour le débogage
    //updateMousePositionDebug(e);

    // Vérifie si on clique sur un Component
    const clickedElement = elements.find((elem) =>
      isPointInElement(e.clientX, e.clientY, elem)
    );

    if (clickedElement) {
      // Sélectionne l'Component cliqué
      setSelectedElementId(clickedElement.id);
      setIsMovingElement(true);
      setElementDragStart({ x: e.clientX, y: e.clientY });
    } else {
      // Si on clique sur le canvas vide, on désélectionne et on commence le pan
      setSelectedElementId(null);
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (isMovingElement && selectedElementId !== null) {
      // Déplacement d'un Component
      const currentCoords = clientToWorkspaceCoordinates(e.clientX, e.clientY);
      const prevCoords = clientToWorkspaceCoordinates(
        elementDragStart.x,
        elementDragStart.y
      );

      const dx = currentCoords.workspaceX - prevCoords.workspaceX;
      const dy = currentCoords.workspaceY - prevCoords.workspaceY;

      setElements(
        elements.map((elem) => {
          if (elem.id === selectedElementId) {
            console.log(elem.id, elem.x, elem.y);
            // Calculer la nouvelle position sans contrainte
            const newX = elem.x + dx;
            const newY = elem.y + dy;

            // Appliquer la contrainte à l'espace d'édition
            const constrained = constrainToEditor(
              newX,
              newY,
              elem.width,
              elem.height
            );

            return { ...elem, x: constrained.x, y: constrained.y };
          }
          return elem;
        })
      );

      setElementDragStart({ x: e.clientX, y: e.clientY });
    } else if (isDragging) {
      // Déplacement du canvas (pan)
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      setPosition({
        x: position.x + dx,
        y: position.y + dy,
      });

      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsMovingElement(false);
  };

  // Assurer que mouse up est détecté même en dehors du canvas
  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Style du curseur
  const getCursorStyle = () => {
    if (isMovingElement) return "move";
    if (isDragging) return "grabbing";
    return "grab";
  };

  // Fonction pour recentrer le canvas
  const handleResetView = () => {
    if (canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();

      // Calcul pour centrer l'éditeur dans le canvas
      const centerX = (canvasRect.width - editorWidth) / 2;
      const centerY = (canvasRect.height - editorHeight) / 2;

      setPosition({ x: centerX, y: centerY });
      setScale(1);
    }
  };

  return (
    <div className="absolute w-full h-screen overflow-hidden bg-stone-950 text-black">
      <div
        ref={canvasRef}
        className="w-full h-full"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: getCursorStyle() }}
      >
        {/* Edit */}
        <div
          ref={editorRef}
          className="relative outline outline-stone-700 aspect-video"
          style={{
            width: `${editorWidth}px`,
            height: `auto`,
            background: "transparent",
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            overflow: "visible",
          }}
        >
          {elements.map((element) =>
            <ElementRenderer
              key={element.id}
              element={element}
              selectedElementId={selectedElementId}
            />
          )}
        </div>
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-510px)] h-10 flex gap-10 justify-center items-center bg-stone-900/90 border-b border-stone-700 px-4 py-2 text-white backdrop-blur-xl">
        <div className="text-sm px-3 py-1">
          Zoom: {Math.round(scale * 100)}%
        </div>
        <div className="text-sm flex space-x-2">
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            onClick={handleResetView}
          >
            Reset
          </button>
        </div>
      </div>

      <LeftPanel />

      <RightPanel />
    </div>
  );
};
