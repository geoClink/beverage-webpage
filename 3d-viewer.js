// 3d-viewer.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function initModelViewer(containerId, modelPath, customScale = 0.8, yOffset = 0) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found.`);
        return;
    }

    const width = container.clientWidth || 120;
    const height = container.clientHeight || 120;

    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 3.5);
    frontLight.position.set(0, 2, 4);
    scene.add(frontLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 2.0);
    backLight.position.set(0, -2, -4);
    scene.add(backLight);

    let model;
    let basePosY = 0;
    const loader = new GLTFLoader();
    const clock = new THREE.Clock();

    loader.load(modelPath, (gltf) => {
        model = gltf.scene;

        // Apply scale parameter
        model.scale.set(customScale, customScale, customScale);

        // Standardize bounding box measurements for all models
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        
        model.position.x = -center.x;
        model.position.z = -center.z;

        // If it's the beer keg, wrap it inside a pivot group so its rotation and float center 
        // remain locked precisely to its local origin regardless of mesh offset hierarchies.
        if (modelPath.includes('beer-keg')) {
            const pivotGroup = new THREE.Group();
            model.position.sub(center); // center local geometry inside the pivot group
            pivotGroup.add(model);
            
            basePosY = 0 + yOffset;
            pivotGroup.position.y = basePosY;
            scene.add(pivotGroup);
            model = pivotGroup; // assign model reference to the pivot group for uniform animation loop
        } else {
            basePosY = -center.y + yOffset;
            model.position.y = basePosY;
            scene.add(model);
        }

    }, undefined, (error) => {
        console.error(`Error loading ${modelPath}:`, error);
    });

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        if (model) {
            model.rotation.y = elapsedTime * 0.2;
            model.position.y = basePosY + Math.sin(elapsedTime * 1.0) * 0.01;
        }

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth || 120;
        const newHeight = container.clientHeight || 120;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });
}