import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeDLine = ({ children }) => {
  const mountRef = useRef(null);
  const lineRef = useRef({ mesh: null });
  const radius = 10;  // Adjusted radius for visibility
  const scale = 1;    // Adjusted scale for visibility
  const segments = 500;
  const colors = ['#FD3A00', '#F50300', '#FF004F', '#FF8E00'];

  useEffect(() => {
    const mount = mountRef.current;

    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      1,
      2000
    );
    camera.position.z = 1000;  // Move the camera back
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;  // Enable shadow mapping
    mount.appendChild(renderer.domElement);

    // Add ambient light and directional light for shadows
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);  // Soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create a gradient rope material using shaders
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec2 vUv;
      uniform vec3 colors[${colors.length}];
      void main() {
        vec3 color;
        float step = 1.0 / float(${colors.length} - 1);
        float progress = vUv.y / step;
        int startColorIndex = int(floor(progress));
        int endColorIndex = int(ceil(progress));
        float colorProgress = fract(progress);

        vec3 startColor = colors[startColorIndex];
        vec3 endColor = colors[endColorIndex];

        color = mix(startColor, endColor, colorProgress);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const ropeMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
      uniforms: {
        colors: { value: colors.map(color => new THREE.Color(color)) },
      },
    });

    // Function to generate control points based on screen size and scroll height
    const generateControlPoints = () => {
      const screenHeight = window.innerHeight;
      const scrollHeight = document.body.scrollHeight;
      const controlPoints = [
        new THREE.Vector3(-window.innerWidth / 2, screenHeight / 3, 0),
        new THREE.Vector3(-window.innerWidth / 4, screenHeight / 6, 0),
        new THREE.Vector3(-window.innerWidth / 4, -screenHeight / 6, 0),
        new THREE.Vector3(window.innerWidth / 4, -screenHeight / 6, 0),
        new THREE.Vector3(window.innerWidth / 4, screenHeight / 6, 0),
        new THREE.Vector3(window.innerWidth / 6, screenHeight / 6, 0),
        new THREE.Vector3(window.innerWidth / 3, -screenHeight / 3, 0),
        new THREE.Vector3(window.innerWidth / 2, -scrollHeight / 2, 0),
      ];

      return controlPoints.map(p => new THREE.Vector3(p.x * scale, p.y * scale, p.z * scale));
    };

    let scaledPoints = generateControlPoints();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Smoothly update the line based on scroll position
    let targetLength = 0;
    let currentLength = 0;
    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      targetLength = scrollPercent * scaledPoints.length;
    };

    const updateGeometry = () => {
      if (currentLength !== targetLength) {
        currentLength += (targetLength - currentLength) * 0.1;
        const endIndex = Math.floor(currentLength);
        const fraction = currentLength - endIndex;

        const currentPoints = scaledPoints.slice(0, endIndex + 1);
        if (endIndex < scaledPoints.length - 1) {
          const nextPoint = scaledPoints[endIndex + 1];
          const lastPoint = scaledPoints[endIndex];
          const interpolatedPoint = lastPoint.clone().lerp(nextPoint, fraction);
          currentPoints.push(interpolatedPoint);
        }

        if (currentPoints.length > 1) {
          const curve = new THREE.CatmullRomCurve3(currentPoints);
          const tubeGeometry = new THREE.TubeGeometry(curve, segments, radius, 20, false);

          if (!lineRef.current.mesh) {
            const tubeMesh = new THREE.Mesh(tubeGeometry, ropeMaterial);
            tubeMesh.castShadow = true;  // Enable shadow casting
            tubeMesh.receiveShadow = true;  // Enable shadow receiving
            scene.add(tubeMesh);
            lineRef.current.mesh = tubeMesh;
          } else {
            scene.remove(lineRef.current.mesh);
            lineRef.current.mesh.geometry.dispose();
            lineRef.current.mesh.geometry = tubeGeometry;
            scene.add(lineRef.current.mesh);
          }
        }
      }
      requestAnimationFrame(updateGeometry);
    };

    window.addEventListener('scroll', handleScroll);
    updateGeometry();

    // Handle window resize
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.left = window.innerWidth / -2;
      camera.right = window.innerWidth / 2;
      camera.top = window.innerHeight / 2;
      camera.bottom = window.innerHeight / -2;
      camera.updateProjectionMatrix();

      // Regenerate control points on resize
      scaledPoints = generateControlPoints();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div>
      <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '500px', zIndex: -1 }} />
      <div style={{ position: 'relative', zIndex: 1, height: '500px', width: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default ThreeDLine;
