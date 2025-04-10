export interface SceneObject {
  id: string;
  type: 'image' | 'text' | 'shape' | 'model3d' | 'video';
  name: string;
  position: { x: number; y: number, z: number };
  rotation: { x: number; y: number, z: number };
  scale: { x: number; y: number, z: number };
  properties: Record<string, any>; // Custom properties for the object
  visible: boolean;
  locked: boolean;
}

export interface Scene {
  id: string;
  name: string;
  objects: SceneObject[];
  background: {
    type: 'color' | 'image' | 'video' | 'gradient';
    value: string; // Color in hex, image URL, video URL, or gradient definition
  };
  camera: {
    position: { x: number; y: number, z: number };
    target: { x: number; y: number, z: number };
  };
}