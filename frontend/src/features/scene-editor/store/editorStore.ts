import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Scene, SceneObject } from '../types';

interface EditorState {
  currentScene: Scene | null;
  selectedObjectId: string | null;
  history: Scene[];
  historyIndex: number;
  
  // Actions
  createNewScene: (name: string) => void;
  addObject: (object: Omit<SceneObject, 'id'>) => void;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  setBackground: (type: 'color' | 'image' | 'video' | 'gradient', value: string) => void;
  undo: () => void;
  redo: () => void;
  saveScene: () => Promise<void>;
  loadScene: (sceneId: string) => Promise<void>;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  currentScene: null,
  selectedObjectId: null,
  history: [],
  historyIndex: -1,
  
  createNewScene: (name) => {
    const newScene: Scene = {
      id: uuidv4(),
      name,
      objects: [],
      background: { type: 'color', value: '#121212' },
      camera: {
        position: { x: 0, y: 0, z: 5 },
        target: { x: 0, y: 0, z: 0 },
      },
    };
    
    set({
      currentScene: newScene,
      selectedObjectId: null,
      history: [newScene],
      historyIndex: 0,
    });
  },
  
  addObject: (object) => {
    const { currentScene, history, historyIndex } = get();
    if (!currentScene) return;
    
    const newObject: SceneObject = {
      ...object,
      id: uuidv4(),
    };
    
    const updatedScene = {
      ...currentScene,
      objects: [...currentScene.objects, newObject],
    };
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedScene);
    
    set({
      currentScene: updatedScene,
      history: newHistory,
      historyIndex: historyIndex + 1,
    });
  },
  
  updateObject: (id, updates) => {
    const { currentScene, history, historyIndex } = get();
    if (!currentScene) return;
    
    const updatedObjects = currentScene.objects.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    );
    
    const updatedScene = {
      ...currentScene,
      objects: updatedObjects,
    };
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedScene);
    
    set({
      currentScene: updatedScene,
      history: newHistory,
      historyIndex: historyIndex + 1,
    });
  },
  
  removeObject: (id) => {
    const { currentScene, selectedObjectId, history, historyIndex } = get();
    if (!currentScene) return;
    
    const updatedObjects = currentScene.objects.filter(obj => obj.id !== id);
    
    const updatedScene = {
      ...currentScene,
      objects: updatedObjects,
    };
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedScene);
    
    set({
      currentScene: updatedScene,
      selectedObjectId: selectedObjectId === id ? null : selectedObjectId,
      history: newHistory,
      historyIndex: historyIndex + 1,
    });
  },
  
  selectObject: (id) => {
    set({ selectedObjectId: id });
  },
  
  setBackground: (type, value) => {
    const { currentScene, history, historyIndex } = get();
    if (!currentScene) return;
    
    const updatedScene = {
      ...currentScene,
      background: { type, value },
    };
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedScene);
    
    set({
      currentScene: updatedScene,
      history: newHistory,
      historyIndex: historyIndex + 1,
    });
  },
  
  undo: () => {
    const { historyIndex } = get();
    if (historyIndex <= 0) return;
    
    set({
      historyIndex: historyIndex - 1,
      currentScene: get().history[historyIndex - 1],
    });
  },
  
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    
    set({
      historyIndex: historyIndex + 1,
      currentScene: history[historyIndex + 1],
    });
  },
  
  saveScene: async () => {
    const { currentScene } = get();
    if (!currentScene) return;
    
    // Simuler une API pour le POC
    console.log('Sauvegarde de la scène:', currentScene);
    localStorage.setItem(`scene_${currentScene.id}`, JSON.stringify(currentScene));
    
    // Dans une vraie implémentation, ce serait:
    // await api.saveScene(currentScene);
  },
  
  loadScene: async (sceneId) => {
    // Simuler une API pour le POC
    const sceneData = localStorage.getItem(`scene_${sceneId}`);
    
    if (sceneData) {
      const scene = JSON.parse(sceneData) as Scene;
      set({
        currentScene: scene,
        selectedObjectId: null,
        history: [scene],
        historyIndex: 0,
      });
    }
    
    // Dans une vraie implémentation, ce serait:
    // const scene = await api.getScene(sceneId);
    // set({ ... });
  },
}));