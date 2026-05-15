import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface VedaCoreProps {
  rejectionCount: number;
  globalCoherence?: number;
  isFocusMode?: boolean;
  triggerReject?: boolean;
  rotation?: number;
  scale?: number;
  color?: string;
  onSensorUpdate?: (data: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    imu: { accel: number; gyro: number };
  }) => void;
}

export const VedaCore: React.FC<VedaCoreProps> = ({ 
  rejectionCount, 
  globalCoherence = 0,
  isFocusMode, 
  triggerReject,
  rotation = 0,
  scale = 1,
  color = "#32CD32",
  onSensorUpdate 
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<THREE.Group | null>(null);
  const leftEarRef = useRef<THREE.Mesh | null>(null);
  const rightEarRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const haloRef = useRef<THREE.Mesh | null>(null);
  const bodyMatRef = useRef<THREE.MeshToonMaterial | null>(null);
  const lastRotationRef = useRef<number>(0);
  const lastEarFlapRef = useRef<number>(0);

  const rejectionCountRef = useRef(rejectionCount);
  const globalCoherenceRef = useRef(globalCoherence);
  const isFocusModeRef = useRef(isFocusMode);
  const triggerRejectRef = useRef(triggerReject);
  const rotationPropRef = useRef(rotation);
  const scalePropRef = useRef(scale);
  const colorPropRef = useRef(color);

  useEffect(() => {
    rejectionCountRef.current = rejectionCount;
    globalCoherenceRef.current = globalCoherence;
    isFocusModeRef.current = isFocusMode;
    triggerRejectRef.current = triggerReject;
    rotationPropRef.current = rotation;
    scalePropRef.current = scale;
    colorPropRef.current = color;
  }, [rejectionCount, globalCoherence, isFocusMode, triggerReject, rotation, scale, color]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasRef.current.appendChild(renderer.domElement);

    const updateSize = (width: number, height: number) => {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        updateSize(width, height);
      }
    });

    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
      const rect = canvasRef.current.getBoundingClientRect();
      updateSize(rect.width, rect.height);
    }

    const group = new THREE.Group();
    scene.add(group);
    coreRef.current = group;

    // Materials - Toon Style (3D mimicking 2D)
    const bodyColor = 0x32CD32; // LimeGreen from user code
    const internalColor = 0xcc3300; // Red internal for ears/limbs
    const eyeColor = 0xFF1493; // DeepPink from user code
    const metalColor = 0x999999;

    const bodyMat = new THREE.MeshToonMaterial({ 
      color: colorPropRef.current,
      side: THREE.DoubleSide
    });
    bodyMatRef.current = bodyMat;

    const internalMat = new THREE.MeshToonMaterial({
      color: internalColor,
      side: THREE.DoubleSide
    });

    const eyeMat = new THREE.MeshToonMaterial({ 
      color: eyeColor,
      emissive: eyeColor,
      emissiveIntensity: 0.8
    });

    const metalMat = new THREE.MeshToonMaterial({
      color: metalColor
    });

    // VEDA Body - Main Sphere
    const bodyGroup = new THREE.Group();
    group.add(bodyGroup);

    // Main Body Shells
    const createShell = (phiStart: number, phiLength: number, thetaStart: number, thetaLength: number) => {
      const geo = new THREE.SphereGeometry(2.2, 64, 32, phiStart, phiLength, thetaStart, thetaLength);
      return new THREE.Mesh(geo, bodyMat);
    };

    // Outline Material
    const outlineMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
    const createOutline = (phiStart: number, phiLength: number, thetaStart: number, thetaLength: number) => {
      const geo = new THREE.SphereGeometry(2.23, 64, 32, phiStart, phiLength, thetaStart, thetaLength);
      return new THREE.Mesh(geo, outlineMat);
    };

    // Top and Bottom Shells with a small gap for the seam
    const topShell = createShell(0, Math.PI * 2, 0, Math.PI / 2 - 0.02);
    const bottomShell = createShell(0, Math.PI * 2, Math.PI / 2 + 0.02, Math.PI / 2 - 0.02);
    
    const topOutline = createOutline(0, Math.PI * 2, 0, Math.PI / 2 - 0.02);
    const bottomOutline = createOutline(0, Math.PI * 2, Math.PI / 2 + 0.02, Math.PI / 2 - 0.02);

    bodyGroup.add(topShell, bottomShell, topOutline, bottomOutline);

    // Middle Seam (Black line)
    const seamGeo = new THREE.TorusGeometry(2.19, 0.015, 8, 128);
    const seamMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const seam = new THREE.Mesh(seamGeo, seamMat);
    seam.rotation.x = Math.PI / 2;
    bodyGroup.add(seam);

    // Internal Cavities (Red) - Visible when ears/limbs open
    const internalGeo = new THREE.SphereGeometry(2.15, 32, 32);
    const internalSphere = new THREE.Mesh(internalGeo, internalMat);
    bodyGroup.add(internalSphere);

    // Eyes - Capsule shape as per user code
    const createEye = (isLeft: boolean) => {
      const eyeGroup = new THREE.Group();
      const eyeGeo = new THREE.CapsuleGeometry(0.22, 0.44, 4, 16);
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      
      const eyeOutlineGeo = new THREE.CapsuleGeometry(0.24, 0.46, 4, 16);
      const eyeOutline = new THREE.Mesh(eyeOutlineGeo, outlineMat);
      
      eyeGroup.add(eyeOutline, eye);
      
      // Proportions from user code: X=0.3R, Y=0.4R, Z=0.9R
      eyeGroup.position.set(isLeft ? -0.66 : 0.66, 0.88, 1.98);
      eyeGroup.rotation.x = Math.PI / 4;
      eyeGroup.rotation.z = isLeft ? 0.15 : -0.15;
      return eyeGroup;
    };
    bodyGroup.add(createEye(true), createEye(false));

    // Ear Flaps - Thin circular plates
    const createCircularEar = () => {
      const earGroup = new THREE.Group();
      const plateGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 32);
      plateGeo.scale(1, 1, 0.8); // Flatten slightly
      
      const top = new THREE.Mesh(plateGeo, bodyMat);
      const bottom = new THREE.Mesh(plateGeo, internalMat);
      bottom.position.y = -0.05;

      const outlineGeo = new THREE.CylinderGeometry(1.23, 1.23, 0.12, 32);
      outlineGeo.scale(1, 1, 0.8);
      const outline = new THREE.Mesh(outlineGeo, outlineMat);
      outline.position.y = -0.025;
      
      earGroup.add(outline, top, bottom);
      earGroup.rotation.x = Math.PI / 2;
      return earGroup;
    };

    const leftEar = createCircularEar();
    leftEar.position.set(-1.4, 1.6, 0);
    leftEar.rotation.z = Math.PI / 4;
    bodyGroup.add(leftEar);
    leftEarRef.current = leftEar as any;

    const rightEar = createCircularEar();
    rightEar.position.set(1.4, 1.6, 0);
    rightEar.rotation.z = -Math.PI / 4;
    bodyGroup.add(rightEar);
    rightEarRef.current = rightEar as any;

    // Limbs - Bellows style
    const createLimb = (isArm: boolean) => {
      const limbGroup = new THREE.Group();
      
      // Bellows
      const bellowsCount = 5;
      for (let i = 0; i < bellowsCount; i++) {
        const bellowsGeo = new THREE.TorusGeometry(0.25, 0.08, 8, 24);
        const bellows = new THREE.Mesh(bellowsGeo, metalMat);
        bellows.rotation.x = Math.PI / 2;
        bellows.position.y = i * 0.25 - 0.5;
        limbGroup.add(bellows);
      }

      // Hand/Foot
      if (isArm) {
        const handGeo = new THREE.SphereGeometry(0.4, 16, 16);
        handGeo.scale(1, 0.7, 1);
        const hand = new THREE.Mesh(handGeo, bodyMat);
        hand.position.y = 0.8;
        limbGroup.add(hand);
        
        // Simple fingers
        for (let i = 0; i < 3; i++) {
          const fGeo = new THREE.CapsuleGeometry(0.1, 0.2, 4, 8);
          const f = new THREE.Mesh(fGeo, bodyMat);
          f.position.set((i - 1) * 0.2, 0.3, 0);
          f.position.y = 1.0;
          limbGroup.add(f);
        }
      } else {
        const footGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.2, 32);
        const foot = new THREE.Mesh(footGeo, bodyMat);
        foot.position.y = 0.8;
        limbGroup.add(foot);
      }

      return limbGroup;
    };

    const lArm = createLimb(true);
    lArm.position.set(-1.8, 0, 0);
    lArm.rotation.z = Math.PI / 2;
    bodyGroup.add(lArm);

    const rArm = createLimb(true);
    rArm.position.set(1.8, 0, 0);
    rArm.rotation.z = -Math.PI / 2;
    bodyGroup.add(rArm);

    const lLeg = createLimb(false);
    lLeg.position.set(-1, -1.8, 0);
    bodyGroup.add(lLeg);

    const rLeg = createLimb(false);
    rLeg.position.set(1, -1.8, 0);
    bodyGroup.add(rLeg);

    // Base Stand - Pedestal style
    const baseGroup = new THREE.Group();
    const baseTopGeo = new THREE.CylinderGeometry(1.0, 1.4, 0.6, 32);
    const baseTop = new THREE.Mesh(baseTopGeo, metalMat);
    
    const baseBottomGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.2, 32);
    const baseBottom = new THREE.Mesh(baseBottomGeo, metalMat);
    baseBottom.position.y = -0.4;
    
    baseGroup.add(baseTop, baseBottom);
    baseGroup.position.y = -2.6;
    group.add(baseGroup);

    // Particles
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.05,
      color: isFocusModeRef.current ? 0x00ffff : 0x32CD32,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);
    particlesRef.current = particles;

    // Halo / Glow Effect
    const haloGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({ 
      color: bodyColor, 
      transparent: true, 
      opacity: 0, 
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    group.add(halo);
    haloRef.current = halo;

    // Lighting - Crucial for Toon Shading
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, -5, 2);
    scene.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mouse = new THREE.Vector2();
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let frameId: number;
    let lastSensorUpdate = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const time = Date.now();
      
      // Particle animation
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(time * 0.001 + positions[i3]) * 0.002;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      
      // Base floating & Breathing
      const isRejecting = rejectionCountRef.current > 7 || triggerRejectRef.current;
      const shake = isRejecting ? (Math.random() - 0.5) * 0.15 : 0;
      const breathing = 1 + Math.sin(time * 0.0012) * 0.02; 
      const pulse = isRejecting ? 1 + Math.sin(time * 0.02) * 0.08 : breathing;
      
      group.position.y = Math.sin(time * 0.002) * 0.1 + shake;
      group.position.x = shake;
      
      // Apply scale from prop
      const baseScale = isFocusModeRef.current ? 1.5 : 1;
      const finalScale = pulse * baseScale * scalePropRef.current;
      group.scale.set(finalScale, finalScale, finalScale);
      
      // Look at mouse
      const baseRotationSpeed = 0.005 + (globalCoherenceRef.current * 0.015);
      const rotationSpeed = isRejecting ? 0.08 : baseRotationSpeed;
      if (coreRef.current) {
        coreRef.current.rotation.y += rotationSpeed;
        // Apply manual rotation from prop
        coreRef.current.rotation.y += rotationPropRef.current * 0.05;
      }

      // Update color if changed
      if (bodyMatRef.current) {
        const targetColor = isRejecting ? 0xff0000 : (rejectionCountRef.current > 4 ? 0xf97316 : new THREE.Color(colorPropRef.current).getHex());
        bodyMatRef.current.color.lerp(new THREE.Color(targetColor), 0.1);
      }

      // Emissive pulse based on coherence
      eyeMat.emissiveIntensity = 0.6 + (globalCoherenceRef.current * 0.4) + (isRejecting ? 1.0 : 0);

      const targetRotY = mouse.x * 0.3;
      const targetRotX = -mouse.y * 0.15;
      group.rotation.y += (targetRotY - group.rotation.y) * 0.05;
      group.rotation.x += (targetRotX - group.rotation.x) * 0.05;

      if (leftEarRef.current && rightEarRef.current) {
        // Ear flapping
        const flapBase = Math.sin(time * 0.003) * 0.2;
        const rejectFlap = isRejecting ? Math.sin(time * 0.02) * 0.5 : 0;
        const totalFlap = flapBase + rejectFlap;
        
        leftEarRef.current.rotation.x = Math.PI / 2 - totalFlap;
        rightEarRef.current.rotation.x = Math.PI / 2 - totalFlap;
      }

      // Limb animations
      const extension = Math.max(0, (rejectionCountRef.current - 1) * 0.2);
      const wave = Math.sin(Date.now() * 0.005) * (0.05 + extension);
      
      lArm.position.x = -2.2 - extension;
      rArm.position.x = 2.2 + extension;
      lArm.rotation.z = Math.PI / 2 + wave;
      rArm.rotation.z = -Math.PI / 2 - wave;
      
      lLeg.position.y = -2.0 - extension * 0.5;
      rLeg.position.y = -2.0 - extension * 0.5;
      lLeg.rotation.x = wave * 0.5;
      rLeg.rotation.x = -wave * 0.5;

      // Sensor Data Simulation (Hardware-Anchored Intent)
      if (time - lastSensorUpdate > 200) { // Throttled to 5Hz
        if (onSensorUpdate && group) {
          onSensorUpdate({
            position: { 
              x: Number(group.position.x.toFixed(3)), 
              y: Number(group.position.y.toFixed(3)), 
              z: Number(group.position.z.toFixed(3)) 
            },
            rotation: { 
              x: Number(group.rotation.x.toFixed(3)), 
              y: Number(group.rotation.y.toFixed(3)), 
              z: Number(group.rotation.z.toFixed(3)) 
            },
            imu: {
              accel: Number((Math.abs(Math.sin(time * 0.005)) * 0.5 + (isRejecting ? 2.0 : 0.1)).toFixed(3)),
              gyro: Number((Math.abs(Math.cos(time * 0.003)) * 0.2 + (isRejecting ? 1.5 : 0.05)).toFixed(3))
            }
          });
        }
        lastSensorUpdate = time;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      if (canvasRef.current) canvasRef.current.removeChild(renderer.domElement);
    };
  }, []);


  useEffect(() => {
    if (!coreRef.current) return;
    const group = coreRef.current;
    const bodyGroup = group.children[0] as THREE.Group;
    
    // Find body shells (first two children of bodyGroup)
    const topShell = bodyGroup.children[0] as THREE.Mesh;
    const bottomShell = bodyGroup.children[1] as THREE.Mesh;
    const bodyMat = topShell.material as THREE.MeshToonMaterial;

    const isRejecting = rejectionCount > 7 || triggerReject;

    if (isRejecting) {
      bodyMat.color.setHex(0xff0000); // Critical Red
    } else if (rejectionCount > 4) {
      bodyMat.color.setHex(0xf97316); // Warning Orange
    } else {
      bodyMat.color.setHex(0x32CD32); // LimeGreen from user code
    }

    const baseScale = isFocusMode ? 1.5 : 1;
    group.scale.set(baseScale, baseScale, baseScale);
    
    if (particlesRef.current) {
      const pMat = particlesRef.current.material as THREE.PointsMaterial;
      pMat.color.setHex(isFocusMode ? 0x00ffff : 0x32CD32);
    }

    if (haloRef.current) {
      const hMat = haloRef.current.material as THREE.MeshBasicMaterial;
      hMat.opacity = isFocusMode ? 0.15 : 0;
    }
  }, [rejectionCount, isFocusMode, triggerReject]);

  return <div ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-90" />;
};
