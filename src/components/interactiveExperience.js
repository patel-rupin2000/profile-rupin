import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const InteractiveExperience = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x2E003E);
    mount.appendChild(renderer.domElement);

    // 🌌 Particles
    const particlesCount = 2000;
    const positions = new Float32Array(particlesCount * 3);
    const originalPositions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = -Math.random() * 100;
      originalPositions[i] = positions[i];
      originalPositions[i + 1] = positions[i + 1];
      originalPositions[i + 2] = positions[i + 2];
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xFF69B4,
      size: 0.004,
      transparent: true,
      sizeAttenuation: true,
      opacity: 1.0,
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // 🌀 Vortex tube
    const tubePath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, -60),
      new THREE.Vector3(0, 0, -80),
      new THREE.Vector3(2, 1, -100),
      new THREE.Vector3(-2, -1, -120),
      new THREE.Vector3(0, 0, -140),
    ]);

    const tubeGeometry = new THREE.TubeGeometry(tubePath, 200, 2.5, 32, false);
    const tubeMaterial = new THREE.MeshBasicMaterial({
      color: 0x9B4F6F,
      wireframe: true,
      transparent: true,
      opacity: 0.0,
    });

    const blackHoleTube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    scene.add(blackHoleTube);

    // 🖱 Interaction
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const pointer3D = new THREE.Vector3();

    let scrollY = 0;
    let time = 0;

    const mouseOffset = new THREE.Vector2(0, 0);
    let targetOffsetX = 0;
    let targetOffsetY = 0;

    const handleMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetOffsetX = mouse.x * 0.1;
      targetOffsetY = mouse.y * 0.1;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    // 🔄 Animate
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.005;

      const scrollPercent = Math.min(scrollY / (document.body.scrollHeight - window.innerHeight), 1);
      const tubeStartScroll = 0.2;

      mouseOffset.x += (targetOffsetX - mouseOffset.x) * 0.05;
      mouseOffset.y += (targetOffsetY - mouseOffset.y) * 0.05;

      // 🎥 Camera
      if (scrollPercent < tubeStartScroll) {
        const z = -scrollPercent * 60;
        camera.position.set(mouseOffset.x, mouseOffset.y, z);
        camera.lookAt(0, 0, z - 1);
      } else {
        const t = (scrollPercent - tubeStartScroll) / (1 - tubeStartScroll);
        const point = tubePath.getPoint(t);
        const look = tubePath.getPoint(Math.min(t + 0.01, 1));
        point.x += mouseOffset.x;
        point.y += mouseOffset.y;
        camera.position.copy(point);
        camera.lookAt(look);
      }

      // 🌌 Fade particles
      if (scrollPercent < 0.38) {
        particleMaterial.opacity = 1.0;
      } else if (scrollPercent < 0.48) {
        particleMaterial.opacity = 1.0 - (scrollPercent - 0.38) * 10;
      } else {
        particleMaterial.opacity = 0.0;
      }

      // 🌀 Fade-in tube (no scaling)
      if (scrollPercent >= 0.20) {
        const t = Math.min((scrollPercent - 0.20) / 0.25, 1);
        const eased = t * t * (3 - 2 * t);
        tubeMaterial.opacity = eased * 0.1;
      } else {
        tubeMaterial.opacity = 0.0;
      }

      // 🧲 Real repulsion from mouse
      raycaster.setFromCamera(mouse, camera);
      const influencePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), camera.position.z - 10);
      raycaster.ray.intersectPlane(influencePlane, pointer3D);

      const posAttr = geometry.getAttribute('position');
      for (let i = 0; i < particlesCount; i++) {
        const ix = i * 3;
        const iy = ix + 1;
        const iz = ix + 2;

        const fx = originalPositions[ix] + Math.sin(time + i) * 0.05;
        const fy = originalPositions[iy] + Math.cos(time + i) * 0.05;
        const fz = originalPositions[iz];

        const dx = fx - pointer3D.x;
        const dy = fy - pointer3D.y;
        const dz = fz - pointer3D.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        let px = fx;
        let py = fy;
        let pz = fz;

        const forceRadius = 5.0;
        const forceStrength = 0.1;

        if (dist < forceRadius) {
          const push = (1 - dist / forceRadius) * forceStrength;
          px += dx * push;
          py += dy * push;
          pz += dz * push;
        }

        posAttr.array[ix] += (px - posAttr.array[ix]) * 0.05;
        posAttr.array[iy] += (py - posAttr.array[iy]) * 0.05;
        posAttr.array[iz] += (pz - posAttr.array[iz]) * 0.05;
      }

      posAttr.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="interactive-experience" />;
};

export default InteractiveExperience;
