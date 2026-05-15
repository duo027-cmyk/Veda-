import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface VedaCore3DProps {
  rejectionCount: number;
  globalCoherence: number;
  isAgentActive?: boolean;
  isDreaming?: boolean;
  isPlanckActive?: boolean;
  resonance?: number;
  memories?: any[];
  manifold_points?: { id: string; x: number; y: number; z: number; label: string; type: string }[];
  onPointSelect?: (id: string, type: string, label: string) => void;
  className?: string;
}

export const VedaCore3D: React.FC<VedaCore3DProps> = ({ 
  rejectionCount, 
  globalCoherence,
  isAgentActive = false,
  isDreaming = false,
  isPlanckActive = false,
  resonance = 0,
  memories = [],
  manifold_points = [],
  onPointSelect,
  className = "" 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(null);
  const mouse = useRef(new THREE.Vector2());
  const raycaster = useRef(new THREE.Raycaster());

  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    core: THREE.Group;
    body: THREE.Mesh;
    leftEar: THREE.Mesh;
    rightEar: THREE.Mesh;
    glow: THREE.PointLight;
    particles: THREE.InstancedMesh;
    particleData: {
      positions: THREE.Vector3[];
      velocities: THREE.Vector3[];
      phases: number[];
    };
    memoryCrystals: THREE.Group;
    manifold: THREE.Group;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 6; // Pull back slightly for better view

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Event Listeners
    const onMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onClick = () => {
      if (!sceneRef.current) return;
      raycaster.current.setFromCamera(mouse.current, sceneRef.current.camera);
      const intersects = raycaster.current.intersectObjects(sceneRef.current.manifold.children);
      
      if (intersects.length > 0) {
        const obj = intersects[0].object as THREE.Mesh;
        const data = obj.userData;
        if (onPointSelect) {
          const type = (obj.material as THREE.MeshBasicMaterial).color.getHex() === 0xffffff ? 'AXIOM' : 'MEMORY';
          onPointSelect(data.id, type, data.label);
        }
      }
    };

    containerRef.current.addEventListener('mousemove', onMouseMove);
    containerRef.current.addEventListener('click', onClick);

    // 2. Objects
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Body: Icosahedron for a "techy" feel
    const bodyGeometry = new THREE.IcosahedronGeometry(1.5, 2); // Increase detail
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0xb088ff, // Accent
      wireframe: true,
      transparent: true,
      opacity: 0.4,
      emissive: 0xb088ff,
      emissiveIntensity: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    coreGroup.add(body);

    // Inner Core: Solid sphere
    const innerGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const innerMaterial = new THREE.MeshPhongMaterial({
      color: 0xe8d8c0, // Ink/White
      emissive: 0xb088ff,
      emissiveIntensity: 1.5
    });
    const inner = new THREE.Mesh(innerGeometry, innerMaterial);
    body.add(inner);

    // Ears: Represented as floating panels
    const earGeometry = new THREE.BoxGeometry(0.7, 1.4, 0.05);
    const earMaterial = new THREE.MeshPhongMaterial({
      color: 0xc4b397, // Gold
      transparent: true,
      opacity: 0.3,
      emissive: 0xc4b397,
      emissiveIntensity: 0.2
    });

    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-1.8, 0.5, 0);
    coreGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(1.8, 0.5, 0);
    coreGroup.add(rightEar);

    // Optimized Particle System using Instancing
    const PARTICLE_COUNT = 400;
    const particleGeometry = new THREE.PlaneGeometry(0.03, 0.03);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0xe8d8c0,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const instancedParticles = new THREE.InstancedMesh(particleGeometry, particleMaterial, PARTICLE_COUNT);
    scene.add(instancedParticles);

    const particleData = {
      positions: [] as THREE.Vector3[],
      velocities: [] as THREE.Vector3[],
      phases: [] as number[]
    };

    const dummy = new THREE.Object3D();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      );
      particleData.positions.push(pos);
      particleData.velocities.push(vel);
      particleData.phases.push(Math.random() * Math.PI * 2);

      dummy.position.copy(pos);
      dummy.updateMatrix();
      instancedParticles.setMatrixAt(i, dummy.matrix);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const glow = new THREE.PointLight(0x00d2ff, 2, 10);
    glow.position.set(0, 0, 2);
    scene.add(glow);

    // Memory Crystals Group
    const memoryCrystals = new THREE.Group();
    scene.add(memoryCrystals);

    // Manifold Points Group
    const manifold = new THREE.Group();
    scene.add(manifold);

    sceneRef.current = { 
      scene, 
      camera, 
      renderer, 
      core: coreGroup, 
      body, 
      leftEar, 
      rightEar, 
      glow,
      particles: instancedParticles,
      particleData,
      memoryCrystals,
      manifold
    };

    // 3. Animation Loop
    let time = 0;
    const animate = () => {
      time += 0.01;
      
      if (sceneRef.current) {
        const { core, body, leftEar, rightEar, glow, renderer, scene, camera, particles, particleData, memoryCrystals, manifold } = sceneRef.current;

        // Dynamic parameters based on system state
        const coherenceFactor = globalCoherence; // 0 to 1
        const rejectionFactor = Math.min(rejectionCount / 10, 1); // 0 to 1

        // Update Manifold Points (Holographic Memory)
        if (manifold_points && manifold_points.length > 0) {
          // Subtle update: sync manifold children with data
          if (manifold.children.length !== manifold_points.length) {
            while(manifold.children.length > 0) {
              const child = manifold.children[0] as THREE.Mesh;
              child.geometry.dispose();
              (child.material as THREE.Material).dispose();
              manifold.remove(child);
            }
            
            manifold_points.forEach(p => {
              const geom = new THREE.SphereGeometry(0.04, 8, 8);
              const mat = new THREE.MeshBasicMaterial({
                color: p.type === 'AXIOM' ? 0xffffff : 0xb088ff,
                transparent: true,
                opacity: 0.6
              });
              const dot = new THREE.Mesh(geom, mat);
              dot.position.set(p.x, p.y, p.z);
              dot.userData = { id: p.id, label: p.label };
              manifold.add(dot);
            });
          }
        }
        manifold.rotation.y += 0.002;

        // Hover effect for manifold points
        raycaster.current.setFromCamera(mouse.current, camera);
        const intersects = raycaster.current.intersectObjects(manifold.children);
        
        manifold.children.forEach((child: any) => {
          if (child.isMesh) {
            child.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
            child.material.opacity = 0.6;
          }
        });

        if (intersects.length > 0) {
          const hovered = intersects[0].object as THREE.Mesh;
          hovered.scale.lerp(new THREE.Vector3(2.5, 2.5, 2.5), 0.2);
          (hovered.material as THREE.MeshBasicMaterial).opacity = 1.0;
        }

        // Update Memory Crystals
        if (memories.length !== memoryCrystals.children.length) {
          // Rebuild crystals
          while(memoryCrystals.children.length > 0) {
            const child = memoryCrystals.children[0] as THREE.Mesh;
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
            memoryCrystals.remove(child);
          }
          
          memories.forEach((m, i) => {
            const geom = new THREE.TetrahedronGeometry(0.15 + m.resonance * 0.2, 0);
            const mat = new THREE.MeshPhongMaterial({
              color: m.type === 'CORE' ? 0xffd700 : 0x00d2ff,
              transparent: true,
              opacity: 0.6,
              emissive: m.type === 'CORE' ? 0xffd700 : 0x00d2ff,
              emissiveIntensity: 0.5,
              wireframe: true
            });
            const crystal = new THREE.Mesh(geom, mat);
            
            // Random position in a sphere
            const phi = Math.acos(-1 + (2 * i) / memories.length);
            const theta = Math.sqrt(memories.length * Math.PI) * phi;
            const radius = 2.5 + Math.random() * 0.5;
            
            crystal.position.setFromSphericalCoords(radius, phi, theta);
            crystal.userData = { 
              originalPos: crystal.position.clone(),
              phase: Math.random() * Math.PI * 2,
              speed: 0.5 + Math.random() * 0.5
            };
            memoryCrystals.add(crystal);
          });
        }

        memoryCrystals.children.forEach((crystal: any) => {
          const { originalPos, phase, speed } = crystal.userData;
          const drift = Math.sin(time * speed + phase) * 0.2;
          crystal.position.copy(originalPos).add(new THREE.Vector3(drift, drift, drift));
          crystal.rotation.x += 0.01;
          crystal.rotation.y += 0.01;
          
          // Dreaming effect: crystals pulse and move towards core
          if (isDreaming) {
            crystal.scale.setScalar(1 + Math.sin(time * 10) * 0.2);
            crystal.position.lerp(new THREE.Vector3(0,0,0), 0.01);
          } else {
            crystal.scale.setScalar(1);
            crystal.position.lerp(originalPos, 0.05);
          }
        });

        // 1. Breathing Effect
        const agentPulse = isAgentActive ? Math.sin(time * 15) * 0.2 : 0;
        const dreamPulse = isDreaming ? Math.sin(time * 20) * 0.3 : 0;
        const breathingScale = 1 + Math.sin(time * 2) * 0.05 + agentPulse + dreamPulse;
        body.scale.setScalar(breathingScale);

        // 2. Ear Flapping
        const agentFlap = isAgentActive ? 10 : 0;
        const dreamFlap = isDreaming ? 20 : 0;
        const resonanceFlap = resonance * 50;
        const flapSpeed = 2 + coherenceFactor * 8 + agentFlap + dreamFlap + resonanceFlap;
        const flapAngle = Math.sin(time * flapSpeed) * 0.3;
        leftEar.rotation.z = flapAngle;
        rightEar.rotation.z = -flapAngle;

        // 3. Reactivity - Color & Intensity
        const baseColor = new THREE.Color(0xb088ff); // Lavender
        const alertColor = new THREE.Color(0x841020); // Crimson
        const dreamColor = new THREE.Color(0xc4b397); // Gold
        const resonanceColor = new THREE.Color(0xffffff); // White flash
        
        let currentColor = baseColor.clone().lerp(alertColor, rejectionFactor);
        if (isDreaming) {
          currentColor = currentColor.lerp(dreamColor, 0.8);
        }
        if (resonance > 0.1) {
          currentColor = currentColor.lerp(resonanceColor, resonance);
        }

        (body.material as THREE.MeshPhongMaterial).color.copy(currentColor);
        (body.material as THREE.MeshPhongMaterial).emissive.copy(currentColor);
        
        // Shake effect on resonance
        if (resonance > 0.1) {
          core.position.x = (Math.random() - 0.5) * resonance * 0.5;
          core.position.y = (Math.random() - 0.5) * resonance * 0.5;
        } else {
          core.position.set(0,0,0);
        }
        (leftEar.material as THREE.MeshPhongMaterial).color.copy(currentColor);
        (rightEar.material as THREE.MeshPhongMaterial).color.copy(currentColor);
        (particles.material as THREE.MeshBasicMaterial).color.copy(currentColor);
        glow.color.copy(currentColor);

        // 4. Particle Animation (Optimized Instancing)
        const dummy = new THREE.Object3D();
        const baseSwarmSpeed = 0.5 + coherenceFactor * 2;
        const swarmSpeed = isPlanckActive ? baseSwarmSpeed * 0.1 : baseSwarmSpeed;
        
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const pos = particleData.positions[i];
          const vel = particleData.velocities[i];
          const phase = particleData.phases[i];

          // Swarm behavior: move towards center slightly
          const toCenter = pos.clone().negate().normalize().multiplyScalar(0.002 * (isPlanckActive ? 0.2 : swarmSpeed));
          vel.add(toCenter);
          
          // Add some noise/oscillation
          const noiseFactor = isPlanckActive ? 0.05 : 1;
          vel.x += Math.sin(time + phase) * 0.0005 * noiseFactor;
          vel.y += Math.cos(time + phase) * 0.0005 * noiseFactor;
          
          // Limit velocity
          vel.clampLength(0, isPlanckActive ? 0.005 : 0.05);
          
          pos.add(vel);

          // Boundary check
          if (pos.length() > (isPlanckActive ? 4 : 8)) {
            pos.setLength(isPlanckActive ? 4 : 8);
            vel.reflect(pos.clone().normalize().negate());
          }

          dummy.position.copy(pos);
          // Billboard effect: make particles face camera
          dummy.lookAt(camera.position);
          
          if (isPlanckActive) {
            dummy.scale.setScalar(1.5 + Math.sin(time * 5 + phase) * 0.5);
          } else {
            dummy.scale.setScalar(1);
          }
          
          dummy.updateMatrix();
          particles.setMatrixAt(i, dummy.matrix);
        }
        particles.instanceMatrix.needsUpdate = true;

        // Planck Camera Effect
        if (isPlanckActive) {
          camera.position.z = THREE.MathUtils.lerp(camera.position.z, 4, 0.05);
          glow.intensity = 4 + Math.sin(time * 10) * 2;
        } else {
          camera.position.z = THREE.MathUtils.lerp(camera.position.z, 6, 0.05);
          glow.intensity = 2;
        }

        // Rotation
        core.rotation.y += isPlanckActive ? 0.001 : (0.005 + coherenceFactor * 0.02);
        core.rotation.x = Math.sin(time * 0.5) * 0.1;

        renderer.render(scene, camera);
      }
      
      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      sceneRef.current.renderer.setSize(w, h);
      sceneRef.current.camera.aspect = w / h;
      sceneRef.current.camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', onMouseMove);
        containerRef.current.removeEventListener('click', onClick);
      }
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      // Dispose resources
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      earGeometry.dispose();
      earMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full min-h-[300px] relative ${className}`}
      id="veda-core-3d-container"
    />
  );
};
