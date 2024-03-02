import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import ModelSidebar from './ModelSidebar';
import download from '../src/utils/download';

const Scene = () => {
    const mountRef = useRef(null);
    const [selectedModel, setSelectedModel] = useState(null);
    const [modelColor, setModelColor] = useState('#ffffff');

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 1, 5);
        camera.lookAt(scene.position);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        renderer.outputEncoding = THREE.sRGBEncoding;
        mountRef.current.appendChild(renderer.domElement);

        // Load HDR environment
        new RGBELoader()
            .setPath('hdr/')
            .load('studio_small_03_4k.exr', function(texture) {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                scene.environment = texture;
            });

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(0, 1, 0);
            scene.add(directionalLight);
        new OrbitControls(camera, renderer.domElement);

        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        const onDragOver = (e) => e.preventDefault();
        const onDrop = (e) => {
            e.preventDefault();
            const modelPath = e.dataTransfer.getData("modelPath");
            setSelectedModel(modelPath);
        };

        mountRef.current.addEventListener("dragover", onDragOver);
        mountRef.current.addEventListener("drop", onDrop);

        return () => {
            if (mountRef.current) {
                mountRef.current.removeEventListener("dragover", onDragOver);
                mountRef.current.removeEventListener("drop", onDrop);
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    // Load the selected model
    useEffect(() => {
        if (selectedModel) {
            const loader = new GLTFLoader();
            loader.load(selectedModel, (gltf) => {
                scene.traverse((child) => {
                    if (child.isMesh) {
                        const color = new THREE.Color(modelColor);
                        child.material.color.set(color);
                    }
                });
                scene.add(gltf.scene);
            }, undefined, console.error);
        }
    }, [selectedModel, modelColor]);

    // The rest of your component...


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
      try {
        const sceneData = JSON.parse(e.target.result);
        sceneRef.current.clear(); // Clear existing scene
        sceneData.forEach(objData => {
          // Example for recreating meshes; adjust according to your saved format and needs
          const geometry = new THREE.BoxGeometry(); // Placeholder
          const material = new THREE.MeshStandardMaterial();
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.fromArray(objData.position);
          mesh.scale.fromArray(objData.scale);
          mesh.rotation.fromArray(objData.rotation);
          sceneRef.current.add(mesh);
        });
      } catch (error) {
        console.error('Error loading scene:', error);
      }
    };

    reader.readAsText(file);
  };
    return (
        <>
            <ModelSidebar onSelectModel={setSelectedModel} />
            <div
                ref={mountRef}
                style={{ width: '80%', height: '80vh' }}
            ></div>
        <input type="color" value={modelColor} onChange={(e) => setModelColor(e.target.value)} />
        <button onClick={handleSaveScene}>Save Scene</button>
        <input type="file" onChange={handleLoadScene} />
    </>
  );
};


export default Scene;
