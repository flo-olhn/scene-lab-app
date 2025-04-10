import React from 'react';
import { Canvas } from './Canvas';
import { useEditorStore } from '../store/editorStore';

export const SceneEditor: React.FC = () => {
  const { createNewScene } = useEditorStore();
  
  // Créer une scène par défaut au chargement
  React.useEffect(() => {
    createNewScene('Nouvelle scène');
  }, [createNewScene]);
  
  return (
    <div className="h-screen w-screen bg-stone-900 text-white overflow-hidden select-none">

      <Canvas />

    </div>
  );
};