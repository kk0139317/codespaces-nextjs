import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const SceneWithPBR = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 1, 5);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.outputEncoding = THREE.sRGBEncoding;
        mountRef.current.appendChild(renderer.domElement);

        new OrbitControls(camera, renderer.domElement);

        // Load HDR Environment
        new RGBELoader()
            .setPath('/hdr/')
            .load('studio_small_03_4k.exr', function (texture) {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                scene.environment = texture;
                scene.background = texture;
            });

        // Load Model and Apply PBR Material
        new GLTFLoader()
            .setPath('/models/')
            .load('sofa_chair.glb', function (gltf) {
                gltf.scene.traverse(function (child) {
                    if (child.isMesh) {
                        child.material = new THREE.MeshStandardMaterial({
                            metalness: 0.5,
                            roughness: 0.1,
                        });
                    }
                });
                scene.add(gltf.scene);
            });

        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            mountRef.current.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} />;
};

export default SceneWithPBR;
