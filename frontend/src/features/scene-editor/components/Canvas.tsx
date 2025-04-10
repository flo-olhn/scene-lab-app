import { useState, useRef, useEffect } from 'react';

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
  
  // Ajout des éléments éditables
  const [elements, setElements] = useState([
    { id: 1, x: 200, y: 100, width: 160, height: 96, color: 'blue', content: 'Élément 1' },
    { id: 2, x: 480, y: 200, width: 256, height: 128, color: 'green', content: 'Élément 2' },
    { id: 3, x: 320, y: 400, width: 200, height: 80, color: 'pink', content: 'Élément 3' },
  ]);
  
  // Gestion de la sélection
  const [selectedElementId, setSelectedElementId] = useState<number | null>(null);
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
    const { workspaceX, workspaceY }: WorkspaceCoordinates = clientToWorkspaceCoordinates(e.clientX, e.clientY);
    
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

  const clientToWorkspaceCoordinates = (clientX: number, clientY: number): WorkspaceCoordinates => {
    if (!canvasRef.current) return { workspaceX: 0, workspaceY: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;
    
    // Conversion en tenant compte de la position et de l'échelle
    const workspaceX = (canvasX - position.x) / scale;
    const workspaceY = (canvasY - position.y) / scale;
    
    return { workspaceX, workspaceY };
  };

  // Fonction pour vérifier si un point est dans un élément
  interface Element {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    content: string;
  }

  const isPointInElement = (clientX: number, clientY: number, element: Element): boolean => {
    const { workspaceX, workspaceY } = clientToWorkspaceCoordinates(clientX, clientY);
    
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

  const constrainToEditor = (x: number, y: number, width: number, height: number): ConstrainToEditorResult => {
    // Contraindre la position X
    const constrainedX = Math.max(0, Math.min(x, editorWidth - width));
    
    // Contraindre la position Y
    const constrainedY = Math.max(0, Math.min(y, editorHeight - height));
    
    return { x: constrainedX, y: constrainedY };
  };


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    // Mise à jour des coordonnées de la souris pour le débogage
    //updateMousePositionDebug(e);
    
    // Vérifie si on clique sur un élément
    const clickedElement = elements.find(elem => isPointInElement(e.clientX, e.clientY, elem));
    
    if (clickedElement) {
      // Sélectionne l'élément cliqué
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
    // Mise à jour des coordonnées de la souris pour le débogage
    //updateMousePositionDebug(e);
    
    if (isMovingElement && selectedElementId !== null) {
      // Déplacement d'un élément
      const currentCoords = clientToWorkspaceCoordinates(e.clientX, e.clientY);
      const prevCoords = clientToWorkspaceCoordinates(elementDragStart.x, elementDragStart.y);
      
      const dx = currentCoords.workspaceX - prevCoords.workspaceX;
      const dy = currentCoords.workspaceY - prevCoords.workspaceY;
      
      setElements(elements.map(elem => {
        if (elem.id === selectedElementId) {
          // Calculer la nouvelle position sans contrainte
          const newX = elem.x + dx;
          const newY = elem.y + dy;
          
          // Appliquer la contrainte à l'espace d'édition
          const constrained = constrainToEditor(newX, newY, elem.width, elem.height);
          
          return { ...elem, x: constrained.x, y: constrained.y };
        }
        return elem;
      }));
      
      setElementDragStart({ x: e.clientX, y: e.clientY });
    } else if (isDragging) {
      // Déplacement du canvas (pan)
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      setPosition({
        x: position.x + dx,
        y: position.y + dy
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
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Style du curseur
  const getCursorStyle = () => {
    if (isMovingElement) return 'move';
    if (isDragging) return 'grabbing';
    return 'grab';
  };

  // Mise à jour des coordonnées de la souris pour le débogage
  /*
  const updateMousePositionDebug = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    
    const { workspaceX, workspaceY } = clientToWorkspaceCoordinates(e.clientX, e.clientY);
    
    setMousePosition({
      x: Math.round(e.clientX - canvasRef.current.getBoundingClientRect().left),
      y: Math.round(e.clientY - canvasRef.current.getBoundingClientRect().top),
      wsX: Math.round(workspaceX),
      wsY: Math.round(workspaceY)
    });
  };
  */

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
    <div className="absolute w-full h-screen overflow-hidden bg-stone-900 text-black">
      
      <div
        ref={canvasRef}
        className="w-full h-full"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: getCursorStyle() }}
      >

        {/* Zone d'édition centrée */}
        <div 
          ref={editorRef}
          className="relative outline outline-stone-700 aspect-video"
          style={{
            width: `${editorWidth}px`,
            height: `auto`,
            background: 'transparent',
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            //boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            overflow: 'visible'
          }}
        >
          
          {/* Éléments éditables */}
          {elements.map(element => (
            <div 
              key={element.id}
              className={`absolute rounded-xl flex items-center justify-center transition-colors`}
              style={{
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: `${element.width}px`,
                height: `${element.height}px`,
                backgroundColor: `${element.color === 'blue' ? '#dbeafe' : 
                                  element.color === 'green' ? '#dcfce7' : 
                                  element.color === 'pink' ? '#fce7f3' : '#f3f4f6'}`,
                outline: selectedElementId === element.id ? '1px solid oklch(62.3% 0.214 259.815)' : 'none',
                cursor: 'move',
                zIndex: selectedElementId === element.id ? 10 : 1
              }}
            >
              {element.content}
              
              {/* Coordonnées de l'élément pour le débogage */}
              <div className="absolute -bottom-0 -right-0 text-xs bg-white bg-opacity-70 px-1"
                style={{ display: selectedElementId === element.id ? 'block' : 'none' }}
              >
                {element.x.toFixed(0)},{element.y.toFixed(0)}
              </div>
              
              {/* Contrôles de sélection */}
              {selectedElementId === element.id && (
                <>
                  {/* Points de contrôle aux coins */}
                  <div className={`absolute w-full h-[2px] bg-blue-500 -top-[2px]`}></div>
                  <div className="absolute w-full h-[2px] bg-blue-500 -bottom-[2px]"></div>
                  <div className="absolute w-[2px] h-full bg-blue-500 -left-[2px]"></div>
                  <div className="absolute w-[2px] h-full bg-blue-500 -right-[2px]"></div>
                  <div className="absolute w-2 h-2 border-2 border-blue-500 bg-white rounded-full -top-[5px] -left-[5px]"></div>
                  <div className="absolute w-2 h-2 border-2 border-blue-500 bg-white rounded-full -top-[5px] -right-[5px]"></div>
                  <div className="absolute w-2 h-2 border-2 border-blue-500 bg-white rounded-full -bottom-[5px] -right-[5px]"></div>
                  <div className="absolute w-2 h-2 border-2 border-blue-500 bg-white rounded-full -bottom-[5px] -left-[5px]"></div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Barre d'informations supérieure */}
      <div className="absolute top-0 w-full h-10 flex justify-between items-center bg-stone-800/30 border-b border-stone-700 px-4 py-2 text-white backdrop-blur-sm">
        <div className="text-sm">
          Zoom: {Math.round(scale * 100)}%
        </div>
        <div className="text-sm flex space-x-2">
          <button 
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            onClick={handleResetView}
          >
            Recentrer
          </button>
        </div>
      </div>

      {/* Panneau gauche */}
      <div className="absolute top-10 w-64 h-[calc(100%-35px)] flex justify-between items-center bg-stone-800/30 border-r border-stone-700 text-white backdrop-blur-sm "></div>
      {/* Panneau droit */}
      <div className="absolute top-10 right-0 w-64  h-[calc(100%-35px)] flex justify-between items-center bg-stone-800/30 border-l border-stone-700 text-white backdrop-blur-sm"></div>
      
      {/* Coordonnées de la souris pour le débogage */}
      
      {/* Info utilisateur */}
      <div className="absolute bottom-4 left-4 bg-white py-1 px-2 rounded shadow text-sm">
        {selectedElementId ? `Élément ${selectedElementId} sélectionné` : 'Aucun élément sélectionné'}
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-white py-1 px-2 rounded shadow text-sm opacity-70">
        Molette = Zoom | Clic + Déplacement = Pan | Clic sur élément = Sélection
      </div>
      
    </div>
  );
}