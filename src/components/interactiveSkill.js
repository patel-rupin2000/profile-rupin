// InteractiveSkill.js
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const InteractiveSkill = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(50, 50, 50);
    scene.add(pointLight);

    // Background
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load('https://example.com/space-background.jpg');
    scene.background = backgroundTexture;

    // Create rockets
    const rockets = [];
    const createRocket = () => {
      const geometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 12);
      const material = new THREE.MeshStandardMaterial({
        color: Math.random() * 0xffffff,
        metalness: 0.6,
        roughness: 0.4,
      });
      const rocket = new THREE.Mesh(geometry, material);
      rocket.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );
      rocket.rotation.x = Math.PI / 2;
      scene.add(rocket);
      rockets.push(rocket);
    };

    for (let i = 0; i < 20; i++) {
      createRocket();
    }

    // Create obstacles
    const obstacles = [];
    const createObstacle = () => {
      const geometry = new THREE.DodecahedronGeometry(Math.random() * 3 + 1);
      const material = new THREE.MeshStandardMaterial({
        color: Math.random() * 0xff0000,
        metalness: 0.4,
        roughness: 0.8,
      });
      const obstacle = new THREE.Mesh(geometry, material);
      obstacle.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );
      scene.add(obstacle);
      obstacles.push(obstacle);
    };

    for (let i = 0; i < 10; i++) {
      createObstacle();
    }

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Ensure rockets and obstacles exist before iteration
      if (rockets.length > 0) {
        rockets.forEach((rocket) => {
          rocket.position.z += 0.5;
          if (rocket.position.z > 50) rocket.position.z = -50;
        });
      }

      if (obstacles.length > 0) {
        obstacles.forEach((obstacle) => {
          obstacle.rotation.x += 0.01;
          obstacle.rotation.y += 0.01;
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      rockets.forEach((rocket) => scene.remove(rocket));
      obstacles.forEach((obstacle) => scene.remove(obstacle));
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="interactive-skill" />;
};

export default InteractiveSkill;
