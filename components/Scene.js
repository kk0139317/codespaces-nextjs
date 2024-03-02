import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import ModelSidebar from './ModelSidebar'; // Adjust the import path as necessary
import  download  from '../src/utils/download'; // Adjust the import path as necessary

const Scene = () => {
  const mountRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [modelColor, setModelColor] = useState('#ffffff');
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-1, 2, 4);
    scene.add(directionalLight);

    new OrbitControls(camera, renderer.domElement);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedModel) {
      const loader = new GLTFLoader();
      loader.load(selectedModel, (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            const color = new THREE.Color(modelColor);
            child.material.color.set(color);
          }
        });
        sceneRef.current.add(gltf.scene);
      }, undefined, console.error);
    }
  }, [selectedModel, modelColor]);

  const handleSaveScene = () => {
    const sceneObjects = sceneRef.current.children.map((obj) => ({
      position: obj.position.toArray(),
      scale: obj.scale.toArray(),
      rotation: obj.rotation.toArray(),
      // Include other properties as necessary
    }));
    download(JSON.stringify(sceneObjects), 'scene.json', 'text/plain');
  };

  const handleLoadScene = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const sceneData = JSON.parse(e.target.result);
      // Assuming the sceneData format matches the saved format
      sceneRef.current.clear(); // Clear existing scene
      sceneData.forEach(objData => {
        // Here you would recreate each object based on objData
        // This is an example for meshes with basic geometry
        const geometry = new THREE.BoxGeometry(); // Placeholder, use actual geometry or load model
        const material = new THREE.MeshStandardMaterial();
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.fromArray(objData.position);
        mesh.scale.fromArray(objData.scale);
        mesh.rotation.fromArray(objData.rotation);
        sceneRef.current.add(mesh);
      });
    };

    reader.readAsText(file);
  };

  return (
    <>
      <ModelSidebar onSelectModel={setSelectedModel} />
      <div
        ref={mountRef}
        style={{ width: '100%', height: '100vh' }}
      ></div>
      <div style={{ position: 'absolute', top: 0, left: '250px', zIndex: 10 }}>
        <input type="color" value={modelColor} onChange={(e) => setModelColor(e.target.value)} />
        <button onClick={handleSaveScene}>Save Scene</button>
        <input type="file" onChange={handleLoadScene} />
      </div>
    </>
  );
};

export default Scene;
