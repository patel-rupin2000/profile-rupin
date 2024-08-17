import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const InteractiveExperience = () => {
  const mountRef = useRef(null);
  const particlesRef = useRef(null);
  const clickParticlesRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x2E003E, 1);  // Set background to black
    mount.appendChild(renderer.domElement);

    // Create a denser particle system
    const particlesCount = 5000; // Increased particle count for density
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const originalPositions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 50; // Spread particles out more
      originalPositions[i] = positions[i]; // Store original positions for later use
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xFF69B4, size: 0.05 }); // Smaller particles for star-like appearance
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 15; // Adjusted camera position for a better view

    // Create a click effect container
    const clickParticles = new THREE.BufferGeometry();
    const clickParticlesCount = 100; // Number of particles for click effect
    const clickPositions = new Float32Array(clickParticlesCount * 3);
    const clickVelocities = new Float32Array(clickParticlesCount * 3);

    for (let i = 0; i < clickParticlesCount * 3; i++) {
      clickPositions[i] = 0;
      clickVelocities[i] = 0;
    }

    clickParticles.setAttribute('position', new THREE.BufferAttribute(clickPositions, 3));
    const clickMaterial = new THREE.PointsMaterial({ color: 0xFF69B4, size: 0.1 }); // Red particles for click effect
    const clickParticlesMesh = new THREE.Points(clickParticles, clickMaterial);
    scene.add(clickParticlesMesh);

    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate the particles slowly to simulate a starfield
      particles.rotation.x += 0.0005;
      particles.rotation.y += 0.0005;

      // Update click particles
      const clickPositionsAttr = clickParticles.getAttribute('position');
      const clickVelocitiesAttr = clickParticles.getAttribute('position');

      for (let i = 0; i < clickParticlesCount * 3; i += 3) {
        clickVelocitiesAttr.array[i] *= 0.95; // Dampen velocity
        clickVelocitiesAttr.array[i + 1] *= 0.95;
        clickVelocitiesAttr.array[i + 2] *= 0.95;

        clickPositionsAttr.array[i] += clickVelocitiesAttr.array[i];
        clickPositionsAttr.array[i + 1] += clickVelocitiesAttr.array[i + 1];
        clickPositionsAttr.array[i + 2] += clickVelocitiesAttr.array[i + 2];
      }

      clickPositionsAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    // Handle mouse movement
    const handleMouseMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      particles.rotation.x = y * 0.2; // Slower rotation on mouse move for subtlety
      particles.rotation.y = x * 0.2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Handle scroll event
    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      particles.position.z = scrollPercent * 50 - 15; // Create a parallax effect on scroll
    };

    window.addEventListener('scroll', handleScroll);

    // Handle particle click effect
    const handleClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Create a ray from the camera to the mouse position
      const mouseVector = new THREE.Vector2(x, y);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouseVector, camera);

      // Spread particles on click
      const positionsAttr = geometry.attributes.position.array;

      for (let i = 0; i < positionsAttr.length; i += 3) {
        const dx = positionsAttr[i] - (x * 50); // Scale factor for position
        const dy = positionsAttr[i + 1] - (y * 50);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) { // Threshold for distance
          // Apply a force to spread the particles
          clickPositions[i] = positionsAttr[i];
          clickPositions[i + 1] = positionsAttr[i + 1];
          clickPositions[i + 2] = positionsAttr[i + 2];

          clickVelocities[i] = (Math.random() - 0.5) * 2;
          clickVelocities[i + 1] = (Math.random() - 0.5) * 2;
          clickVelocities[i + 2] = (Math.random() - 0.5) * 2;
        }
      }

      clickParticles.getAttribute('position').needsUpdate = true;
    };

    window.addEventListener('click', handleClick);

    // Handle window resize
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="interactive-experience" />;
};

export default InteractiveExperience;
