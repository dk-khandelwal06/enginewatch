"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Info, RotateCw, ZoomIn, Eye, Activity, ShieldCheck } from "lucide-react";

interface ComponentHotspot {
  id: string;
  name: string;
  station: string;
  sensors: string[];
  description: string;
  nominalTemp: string;
  pressure: string;
  position: [number, number, number];
}

const HOTSPOTS: ComponentHotspot[] = [
  {
    id: "fan",
    name: "Wide-Chord Fan Stage",
    station: "Station 2.0 (Intake)",
    sensors: ["s_8 (Fan Speed)", "s_13 (Corrected Fan Speed)"],
    description: "Solid titanium wide-chord fan producing over 80% of total bypass thrust in modern turbofans.",
    nominalTemp: "518.7 °R (Ambient)",
    pressure: "14.7 psia",
    position: [0, 0, 3.4],
  },
  {
    id: "compressor",
    name: "High-Pressure Compressor (HPC)",
    station: "Station 3.0 (Diffuser)",
    sensors: ["s_2 (LPC Outlet)", "s_3 (HPC Outlet Temp)", "s_7 (HPC Total Pressure)", "s_11 (Static Ps30)"],
    description: "Multistage axial compressor raising airflow pressure ratio before combustion entry. Highly susceptible to blade tip rub and fouling.",
    nominalTemp: "1,586.9 °R",
    pressure: "553.9 psia",
    position: [0, 0, 1.2],
  },
  {
    id: "combustor",
    name: "Annular Combustion Chamber",
    station: "Station 4.0 (Burner)",
    sensors: ["s_12 (Fuel Flow Ratio)", "s_17 (Bleed Enthalpy)"],
    description: "High-temperature combustor where atomized aviation fuel mixes with core air. Thermal fatigue governs liner life.",
    nominalTemp: "2,450.0 °R",
    pressure: "542.0 psia",
    position: [0, 0, -0.4],
  },
  {
    id: "turbine",
    name: "High-Pressure Turbine (HPT)",
    station: "Station 4.5 (Turbine Inlet)",
    sensors: ["s_4 (LPT Outlet EGT)", "s_20 (HPT Coolant Bleed)", "s_21 (LPT Coolant Bleed)"],
    description: "Single-crystal nickel alloy turbine blades with internal cooling passages. The primary driver of Remaining Useful Life degradation.",
    nominalTemp: "1,402.8 °R (EGT)",
    pressure: "185.0 psia",
    position: [0, 0, -1.8],
  },
  {
    id: "exhaust",
    name: "Exhaust Nozzle & Core Cone",
    station: "Station 8.0 (Nozzle)",
    sensors: ["s_9 (Core Speed)", "s_14 (Corrected Core Speed)", "s_15 (Bypass Ratio)"],
    description: "Convergent core mixer directing expanded core exhaust and bypass air to maximize propulsive efficiency.",
    nominalTemp: "1,120.0 °R",
    pressure: "16.2 psia",
    position: [0, 0, -3.2],
  },
];

export const Engine3DViewer = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeHotspot, setActiveHotspot] = useState<ComponentHotspot>(HOTSPOTS[0]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [webGlSupported, setWebGlSupported] = useState(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const fanGroupRef = useRef<THREE.Group | null>(null);
  const coreGroupRef = useRef<THREE.Group | null>(null);
  const combustorGlowRef = useRef<THREE.PointLight | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL support
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5.5, 3.2, 6.5);
    camera.lookAt(0, 0, 0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // 3. Lighting (Aerospace Technical Rig)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x42d5f2, 2.4);
    keyLight.position.set(8, 12, 10);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x287fc4, 1.8);
    fillLight.position.set(-8, -4, -6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
    rimLight.position.set(0, -10, 8);
    scene.add(rimLight);

    // Dynamic Combustor Core Glow
    const combustorGlow = new THREE.PointLight(0xf0a43a, 3.5, 5);
    combustorGlow.position.set(0, 0, -0.4);
    scene.add(combustorGlow);
    combustorGlowRef.current = combustorGlow;

    // 4. Build Procedural Turbofan Engine Model
    const engineRoot = new THREE.Group();
    scene.add(engineRoot);

    // Materials
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x95a5a6,
      metalness: 0.85,
      roughness: 0.25,
    });

    const polishedMat = new THREE.MeshStandardMaterial({
      color: 0xbdc3c7,
      metalness: 0.92,
      roughness: 0.15,
    });

    const cowlCutawayMat = new THREE.MeshStandardMaterial({
      color: 0x112233,
      metalness: 0.7,
      roughness: 0.35,
      transparent: true,
      opacity: 0.45,
      wireframe: false,
    });

    const darkCoreMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      metalness: 0.6,
      roughness: 0.4,
    });

    const burnerMat = new THREE.MeshStandardMaterial({
      color: 0xe67e22,
      emissive: 0xd35400,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });

    // A. Outer Nacelle / Cowling (Cutaway view)
    const cowlGeo = new THREE.CylinderGeometry(2.1, 1.7, 7.2, 32, 1, true, 0, Math.PI * 1.35);
    cowlGeo.rotateX(Math.PI / 2);
    const cowl = new THREE.Mesh(cowlGeo, cowlCutawayMat);
    engineRoot.add(cowl);

    // Nacelle Highlight Rings
    const ringGeo = new THREE.TorusGeometry(2.12, 0.04, 16, 64);
    const ring1 = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x42d5f2 }));
    ring1.position.z = 3.6;
    engineRoot.add(ring1);

    // B. Central Drive Shaft & Core Casing
    const shaftGeo = new THREE.CylinderGeometry(0.35, 0.35, 7.8, 24);
    shaftGeo.rotateX(Math.PI / 2);
    const shaft = new THREE.Mesh(shaftGeo, polishedMat);
    engineRoot.add(shaft);

    const coreCasingGeo = new THREE.CylinderGeometry(1.05, 0.85, 4.6, 24, 1, true);
    coreCasingGeo.rotateX(Math.PI / 2);
    coreCasingGeo.translate(0, 0, -0.4);
    const coreCasing = new THREE.Mesh(coreCasingGeo, darkCoreMat);
    engineRoot.add(coreCasing);

    // C. Spinning Fan Stage (Front Intake)
    const fanGroup = new THREE.Group();
    fanGroup.position.z = 3.4;
    engineRoot.add(fanGroup);
    fanGroupRef.current = fanGroup;

    // Spinner Cone
    const spinnerGeo = new THREE.ConeGeometry(0.55, 1.2, 24);
    spinnerGeo.rotateX(Math.PI / 2);
    spinnerGeo.translate(0, 0, 0.5);
    const spinner = new THREE.Mesh(spinnerGeo, polishedMat);
    fanGroup.add(spinner);

    // Fan Blades (24 Blades)
    const bladeGeo = new THREE.BoxGeometry(0.18, 1.6, 0.04);
    bladeGeo.translate(0, 0.8, 0);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0x93a4b0,
      metalness: 0.9,
      roughness: 0.2,
    });

    const bladeCount = 24;
    for (let i = 0; i < bladeCount; i++) {
      const angle = (i / bladeCount) * Math.PI * 2;
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.rotation.z = angle;
      blade.rotation.y = 0.35; // Aerodynamic pitch angle
      fanGroup.add(blade);
    }

    // D. High-Pressure Compressor (HPC Discs)
    const coreGroup = new THREE.Group();
    engineRoot.add(coreGroup);
    coreGroupRef.current = coreGroup;

    for (let i = 0; i < 6; i++) {
      const radius = 0.95 - i * 0.04;
      const discGeo = new THREE.CylinderGeometry(radius, radius, 0.12, 24);
      discGeo.rotateX(Math.PI / 2);
      const disc = new THREE.Mesh(discGeo, titaniumMat);
      disc.position.z = 2.0 - i * 0.32;
      coreGroup.add(disc);
    }

    // E. Annular Combustor Ring
    const burnerGeo = new THREE.TorusGeometry(0.78, 0.18, 16, 32);
    const burner = new THREE.Mesh(burnerGeo, burnerMat);
    burner.position.z = -0.4;
    engineRoot.add(burner);

    // F. Turbine Stages (HPT & LPT)
    for (let i = 0; i < 4; i++) {
      const radius = 0.72 + i * 0.05;
      const turbDiscGeo = new THREE.CylinderGeometry(radius, radius, 0.14, 24);
      turbDiscGeo.rotateX(Math.PI / 2);
      const turbDisc = new THREE.Mesh(turbDiscGeo, titaniumMat);
      turbDisc.position.z = -1.2 - i * 0.35;
      coreGroup.add(turbDisc);
    }

    // G. Tail Exhaust Cone
    const tailConeGeo = new THREE.ConeGeometry(0.42, 1.8, 24);
    tailConeGeo.rotateX(-Math.PI / 2);
    tailConeGeo.translate(0, 0, -3.8);
    const tailCone = new THREE.Mesh(tailConeGeo, darkCoreMat);
    engineRoot.add(tailCone);

    // H. Add Interactive Hotspot 3D Spheres
    HOTSPOTS.forEach((spot) => {
      const sphereGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: spot.id === activeHotspot.id ? 0x42d5f2 : 0xf0a43a,
      });
      const marker = new THREE.Mesh(sphereGeo, sphereMat);
      marker.position.set(...spot.position);
      marker.name = `hotspot_${spot.id}`;
      engineRoot.add(marker);
    });

    // 5. Interactive Mouse Orbit Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      engineRoot.rotation.y += deltaX * 0.008;
      engineRoot.rotation.x += deltaY * 0.008;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(3.5, Math.min(12, camera.position.z + e.deltaY * 0.005));
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("wheel", onWheel, { passive: false });

    // 6. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Spin fan and turbine discs
      if (fanGroupRef.current) {
        fanGroupRef.current.rotation.z += delta * 4.5;
      }
      if (coreGroupRef.current) {
        coreGroupRef.current.rotation.z += delta * 6.0;
      }

      // Subtle slow auto orbit if enabled
      if (autoRotate && !isDragging) {
        engineRoot.rotation.y += delta * 0.18;
      }

      // Pulse combustor glow
      if (combustorGlowRef.current) {
        combustorGlowRef.current.intensity = 3.0 + Math.sin(clock.getElapsedTime() * 8) * 0.8;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("wheel", onWheel);
      renderer.dispose();
    };
  }, [autoRotate, activeHotspot.id]);

  return (
    <div className="relative w-full rounded-2xl border border-theme-border bg-theme-surface/80 backdrop-blur-md overflow-hidden shadow-2xl">
      {/* Viewer Header / Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-theme-border bg-theme-bg/60">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="text-base font-semibold tracking-wider text-theme-textPrimary uppercase">
            Interactive High-Bypass Turbofan System (3D Digital Twin)
          </h3>
        </div>

        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors ${
              autoRotate
                ? "border-cyan-400 text-cyan-400 bg-cyan-950/30"
                : "border-theme-border text-theme-textMuted hover:border-theme-textMuted"
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{autoRotate ? "Auto-Orbit ON" : "Auto-Orbit OFF"}</span>
          </button>
          <div className="hidden sm:flex items-center space-x-1 text-xs font-mono text-theme-textMuted px-2">
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Drag to Orbit / Scroll to Zoom</span>
          </div>
        </div>
      </div>

      {/* Main 3D Canvas Area */}
      <div className="relative w-full h-[460px] md:h-[540px] bg-gradient-to-b from-theme-bg/80 via-transparent to-theme-bg/80">
        {webGlSupported ? (
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        ) : (
          /* Technical Fallback if WebGL unavailable */
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Activity className="w-16 h-16 text-cyan-400 mb-4 animate-pulse" />
            <h4 className="text-lg font-semibold text-theme-textPrimary">Hardware WebGL Acceleration Unavailable</h4>
            <p className="text-sm text-theme-textMuted max-w-md mt-2">
              Displaying technical component schematic. Hardware 3D rendering requires WebGL-enabled browser.
            </p>
          </div>
        )}

        {/* Hotspot Station Navigation Pills */}
        <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 pointer-events-auto">
          {HOTSPOTS.map((spot) => (
            <button
              key={spot.id}
              onClick={() => setActiveHotspot(spot)}
              className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-all ${
                activeHotspot.id === spot.id
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(66,213,242,0.3)]"
                  : "bg-theme-surface/70 border-theme-border text-theme-textMuted hover:border-cyan-500/50 hover:text-theme-textPrimary"
              }`}
            >
              {spot.station}
            </button>
          ))}
        </div>

        {/* Selected Hotspot Detail Overlay Card */}
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-md p-4 rounded-xl border border-theme-border bg-theme-card/95 backdrop-blur-md shadow-xl pointer-events-auto">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
                {activeHotspot.station}
              </span>
              <h4 className="text-base font-bold text-theme-textPrimary mt-0.5">
                {activeHotspot.name}
              </h4>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              NOMINAL
            </span>
          </div>

          <p className="text-xs text-theme-textMuted mt-2 leading-relaxed">
            {activeHotspot.description}
          </p>

          {/* Telemetry Sensor Badges */}
          <div className="mt-3 pt-3 border-t border-theme-border/60">
            <span className="text-[10px] font-mono text-theme-textMuted uppercase tracking-wider block mb-1.5">
              Associated C-MAPSS Telemetry Channels:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeHotspot.sensors.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[10px] font-mono rounded bg-theme-surface border border-theme-border text-theme-textPrimary"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Operational Ratings */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-2 text-[11px] font-mono">
            <div className="bg-theme-bg/60 p-2 rounded border border-theme-border/40">
              <span className="text-theme-textMuted block text-[10px]">Station Temperature</span>
              <span className="text-cyan-400 font-semibold">{activeHotspot.nominalTemp}</span>
            </div>
            <div className="bg-theme-bg/60 p-2 rounded border border-theme-border/40">
              <span className="text-theme-textMuted block text-[10px]">Static Pressure</span>
              <span className="text-cyan-400 font-semibold">{activeHotspot.pressure}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
