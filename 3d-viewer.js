// 3d-viewer.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function initCokeCanViewer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found.`);
        return;
    }

    const width = container.clientWidth || 120;
    const height = container.clientHeight || 120;

    const scene = new THREE.Scene();
    
    // Pulled camera back to 8.0 so the whole object fits in view
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
    const loader = new GLTFLoader();
    const clock = new THREE.Clock();

    loader.load('./coke-can.glb', (gltf) => {
        model = gltf.scene;

        // Center the model geometry precisely
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // Scale the model down just in case it was exported large from Blender
        model.scale.set(0.8, 0.8, 0.8);

        scene.add(model);
    }, undefined, (error) => {
        console.error('Error loading coke-can.glb:', error);
    });

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        if (model) {
            // Clean, steady rotation in place
            model.rotation.y = elapsedTime * 0.8;
            // Subtle bob that stays safely inside the container box
            model.position.y = Math.sin(elapsedTime * 2) * 0.05;
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