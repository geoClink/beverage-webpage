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

    // Mouse tracking variables for interactive wiggling
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const parentCard = container.closest('.product-card') || container;
    
    parentCard.addEventListener('mousemove', (e) => {
        const rect = parentCard.getBoundingClientRect();
        // Normalize mouse coordinates between -1 and 1 based on card dimensions
        mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    });

    parentCard.addEventListener('mouseleave', () => {
        mouseX = 0;
        mouseY = 0;
    });

    loader.load(modelPath, (gltf) => {
        model = gltf.scene;

        // Apply scale parameter
        model.scale.set(customScale, customScale, customScale);

        // Standardize bounding box measurements for all models
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        
        // If it's the beer keg, wrap it inside a pivot group with proper local centering
        if (modelPath.includes('beer-keg')) {
            const pivotGroup = new THREE.Group();
            
            model.position.x = -center.x;
            model.position.y = -center.y;
            model.position.z = -center.z;
            
            pivotGroup.add(model);
            
            basePosY = 0 + yOffset;
            pivotGroup.position.y = basePosY;
            scene.add(pivotGroup);
            model = pivotGroup;
        } else {
            model.position.x = -center.x;
            model.position.z = -center.z;
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
            // Smoothly interpolate towards mouse position for a spring/wiggle effect
            targetRotationY += (mouseX * 0.8 - targetRotationY) * 0.1;
            targetRotationX += (mouseY * 0.8 - targetRotationX) * 0.1;

            // Base continuous auto-rotation + mouse directional wiggle tilt
            model.rotation.y = (elapsedTime * 0.2) + targetRotationY;
            model.rotation.x = targetRotationX;

            // Organic floating bob with a slightly faster oscillation frequency on hover
            const hoverSpeedMultiplier = (Math.abs(mouseX) > 0 || Math.abs(mouseY) > 0) ? 1.8 : 1.0;
            model.position.y = basePosY + Math.sin(elapsedTime * 1.0 * hoverSpeedMultiplier) * 0.02;
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