import * as THREE from 'three'; 
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; 

export function initModelViewer(containerId, modelPath, customScale = 2.5, yOffset = 0, labelTexturePath = null) { 
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

    // Premium Studio Lighting Configuration
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0); 
    scene.add(ambientLight); 

    const frontLight = new THREE.DirectionalLight(0xffffff, 4.0); 
    frontLight.position.set(0, 2, 4); 
    scene.add(frontLight); 

    const backLight = new THREE.DirectionalLight(0xffffff, 2.5); 
    backLight.position.set(0, -2, -4); 
    scene.add(backLight); 

    // Clear rim light highlights for dark glass edge definitions
    const sideLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sideLight.position.set(-4, 0, 2);
    scene.add(sideLight);

    let model; 
    let basePosY = 0; 
    const loader = new GLTFLoader(); 
    const clock = new THREE.Clock(); 

    loader.load(modelPath, (gltf) => { 
        model = gltf.scene; 

               // --- FIXED: Dynamically Isolate Bottle Glass, Can Aluminum, and Keg Stainless Steel --- 
        model.traverse((child) => { 
            if (child.isMesh) { 
                if (child.material) { 
                    child.material.needsUpdate = true; 

                    // Fix colorspace matching across all models so textures look vibrant
                    if (child.material.map) {
                        child.material.map.colorSpace = THREE.SRGBColorSpace;
                    }

                    const meshName = child.name.toLowerCase();

                    // 1. CHOOSE YOUR MODEL PATH TARGETS
                    if (modelPath.includes('glass-bottle')) {
                        // BOTTLE SHADERS: Glass & Liquid
                        if (meshName.includes('mesh_0') || meshName.includes('bottle')) {
                            const oldMat = child.material;
                            child.material = new THREE.MeshPhysicalMaterial({
                                map: oldMat.map,
                                color: 0xffffff,        // Pure clear flint glass
                                roughness: 0.02,       // Highly polished reflection skin
                                metalness: 0.0,
                                transmission: 1.0,     // 100% crystal-clear transparency
                                ior: 1.52,             // Refractive light bending constant of glass
                                thickness: 0.15,       // Thin walls so inner drink shines through cleanly
                                transparent: true
                            });
                        }
                        if (meshName.includes('mesh_0.001') || meshName.includes('liquid') || meshName.includes('fluid')) {
                            const oldMat = child.material;
                            child.material = new THREE.MeshPhysicalMaterial({
                                map: oldMat.map,
                                color: 0xd27d2d,       // Rich honey amber beverage color
                                roughness: 0.02,
                                metalness: 0.0,
                                transmission: 0.9,     // Deep sub-surface liquid look
                                ior: 1.33,             // Liquid refractive constant
                                transparent: true
                            });
                        }
                    } 
                    
                    else if (modelPath.includes('coke-can')) {
                        // CAN SHADERS: Glossy Metallic Aluminum
                        child.material.roughness = 0.15;       // Smooth sheen highlights
                        child.material.metalness = 0.85;      // High metal reflectivity factor
                    } 
                    
                    else if (modelPath.includes('beer-keg')) {
                        // KEG SHADERS: Brushed Heavy Stainless Steel
                        child.material.color.setHex(0xcccccc); // Clean industrial steel tint
                        child.material.roughness = 0.25;       // Brushed satin metal scratch profile
                        child.material.metalness = 0.95;      // High mirror-like steel reflectivity reflection
                    }
                } 
            } 
        }); 


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
            model.rotation.y = elapsedTime * 0.2;
            model.position.y = basePosY + Math.sin(elapsedTime * 1.0) * 0.02;
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
