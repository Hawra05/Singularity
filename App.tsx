/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';

const DATABASE = {
  space: {
    bits: "2.57 × 10⁶⁹ BITS",
    logic: "ENTITY ID: 001 [ABSOLUTE SPACE]\nPHYSICS: THE BEKENSTEIN BOUND.\n\nCalculation: Maximum information capacity of a human-scale volume.\nSimulation Paradox: Any additional data would trigger a gravitational singularity.\nVisualizing: Zero-point quantum fluctuations.",
    color: 0x00f2ff
  },
  atom: {
    bits: "1.02 × 10⁸ BITS",
    logic: "ENTITY ID: 002 [HYDROGEN ATOM]\nPHYSICS: SCHRÖDINGER WAVEFUNCTION.\n\nMapping the 1s ground state probability cloud.\nComputational Cost: Information required to resolve the position-momentum uncertainty.\nSimulation depth: Planck-resolution digital twin.",
    color: 0xffffff
  },
  virus: {
    bits: "3.37 × 10⁵ BITS",
    logic: "ENTITY ID: 003 [BACTERIOPHAGE T4]\nPHYSICS: GENOMIC ENTROPY.\n\nRaw Data: 168,903 base pairs (DNA complexity).\nInformation encompasses the total genomic state of the viral capsid.\nStructure: Icosahedral-Hexagonal complex virus.",
    color: 0xff00ff
  },
  hydra: {
    bits: "2.90 × 10⁹ BITS",
    logic: "ENTITY ID: 004 [HYDRA VULGARIS]\nPHYSICS: BIOLOGICAL COMPLEXITY.\n\nRaw Data: 1.45 billion base pairs (Cnidarian complexity).\nInformation capacity accounts for nearly immortal cellular regeneration.\nSimulation of primitive nervous system entropy.",
    color: 0xffff00
  },
  bucky: {
    bits: "4.80 × 10⁵ BITS",
    logic: "ENTITY ID: 005 [C60 FULLERENE]\nPHYSICS: sp2 HYBRIDIZATION.\n\nTargeting 60 carbon atoms in a truncated icosahedral lattice.\nGeometry governed by the Ih symmetry group parameters.\nStructural stability: Calculated at absolute equilibrium.",
    color: 0x00ff88
  }
};

type TargetKey = keyof typeof DATABASE;

export default function App() {
  const [isEngaged, setIsEngaged] = useState(false);
  const [currentTarget, setCurrentTarget] = useState<TargetKey>('space');
  const [bitsText, setBitsText] = useState("");
  const [logicText, setLogicText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const fluctuationsRef = useRef<{ mesh: THREE.Mesh; life: number }[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- AUDIO HELPERS ---
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playGlassClick = () => {
    if (!audioCtxRef.current) return;
    const osc = audioCtxRef.current.createOscillator();
    const g = audioCtxRef.current.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(4200, audioCtxRef.current.currentTime);
    g.gain.setValueAtTime(0.015, audioCtxRef.current.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.03);
    osc.connect(g);
    g.connect(audioCtxRef.current.destination);
    osc.start();
    osc.stop(audioCtxRef.current.currentTime + 0.03);
  };

  const playZipSound = () => {
    if (!audioCtxRef.current) return;
    const osc = audioCtxRef.current.createOscillator();
    const g = audioCtxRef.current.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(60, audioCtxRef.current.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1500, audioCtxRef.current.currentTime + 0.15);
    g.gain.setValueAtTime(0.02, audioCtxRef.current.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.15);
    osc.connect(g);
    g.connect(audioCtxRef.current.destination);
    osc.start();
    osc.stop(audioCtxRef.current.currentTime + 0.15);
  };

  // --- TYPING ANIMATION ---
  const typeText = (target: "bits" | "logic", text: string, speed: number) => {
    let i = 0;
    const setter = target === "bits" ? setBitsText : setLogicText;
    setter("");
    const interval = setInterval(() => {
      setter((prev) => prev + text[i]);
      if (text[i] !== " " && text[i] !== "\n") playGlassClick();
      i++;
      if (i >= text.length - 1) clearInterval(interval);
    }, speed);
    return interval;
  };

  // --- THREE.JS ENGINE ---
  useEffect(() => {
    if (!isEngaged || !containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 13;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const light = new THREE.PointLight(0x00f2ff, 2.5, 60);
    light.position.set(12, 12, 12);
    scene.add(light, new THREE.AmbientLight(0xffffff, 0.2));

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    groupRef.current = group;

    const animate = () => {
      requestAnimationFrame(animate);
      if (groupRef.current) {
        groupRef.current.rotation.y += 0.003;

        // Special case for Hydra swaying
        if (currentTarget === 'hydra') {
          groupRef.current.children.forEach((child, i) => {
            if (i > 0) child.rotation.x = 1.2 + Math.sin(Date.now() * 0.002 + i) * 0.2;
          });
        }

        fluctuationsRef.current.forEach((p) => {
          if (p.life <= 0 && Math.random() > 0.993) {
            p.life = 35 + Math.random() * 40;
            p.mesh.visible = true;
            p.mesh.position.set((Math.random() - 0.5) * 13, (Math.random() - 0.5) * 13, (Math.random() - 0.5) * 13);
          } else if (p.life > 0) {
            p.life--;
            // @ts-ignore
            p.mesh.material.opacity = Math.sin((p.life / 75) * Math.PI) * 0.45;
            if (p.life <= 0) p.mesh.visible = false;
          }
        });
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [isEngaged]);

  const drawModel = (type: TargetKey) => {
    if (!groupRef.current) return;
    const group = groupRef.current;
    
    // Clear existing
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
    fluctuationsRef.current = [];
    const col = DATABASE[type].color;

    if (type === 'space') {
      for (let i = 0; i < 180; i++) {
        const p = new THREE.Mesh(
          new THREE.SphereGeometry(0.015),
          new THREE.MeshBasicMaterial({ color: col, transparent: true })
        );
        p.visible = false;
        group.add(p);
        fluctuationsRef.current.push({ mesh: p, life: 0 });
      }
    } else if (type === 'atom') {
      const nuc = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff3300 }));
      const pts = [];
      for (let i = 0; i < 25000; i++) {
        const r = -Math.log(Math.random()) * 1.6;
        const theta = Math.random() * 6.28, phi = Math.acos(2 * Math.random() - 1);
        pts.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
      }
      const cloudGeo = new THREE.BufferGeometry();
      cloudGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      group.add(nuc, new THREE.Points(cloudGeo, new THREE.PointsMaterial({ color: col, size: 0.025, transparent: true, opacity: 0.35 })));
    } else if (type === 'virus') {
      const head = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0, 0), new THREE.MeshStandardMaterial({ color: col, wireframe: true }));
      const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.4), new THREE.MeshStandardMaterial({ color: col }));
      tail.position.y = -1.8;
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.18, 6), new THREE.MeshStandardMaterial({ color: col }));
      plate.position.y = -3.0;
      group.add(head, tail, plate);
      for (let i = 0; i < 6; i++) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.2), new THREE.MeshStandardMaterial({ color: col }));
        leg.position.set(Math.cos(i) * 0.9, -4.2, Math.sin(i) * 0.9);
        leg.rotation.z = 0.7;
        group.add(leg);
      }
    } else if (type === 'hydra') {
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 3, 16), new THREE.MeshStandardMaterial({ color: col, wireframe: true }));
      group.add(body);
      for (let i = 0; i < 8; i++) {
        const tentacle = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 1.5, 4, 12), new THREE.MeshStandardMaterial({ color: col }));
        tentacle.position.y = 1.5;
        tentacle.rotation.z = (Math.PI / 4) * i;
        tentacle.rotation.x = 1.2;
        group.add(tentacle);
      }
    } else if (type === 'bucky') {
      const geo = new THREE.IcosahedronGeometry(2.8, 1);
      group.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, wireframe: true })));
      group.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 })));
    }
  };

  const switchTarget = (key: TargetKey) => {
    setCurrentTarget(key);
    playZipSound();
    typeText('bits', DATABASE[key].bits, 40);
    setTimeout(() => typeText('logic', DATABASE[key].logic, 15), 600);
    drawModel(key);
  };

  const engageSimulation = () => {
    initAudio();
    playZipSound();
    setIsEngaged(true);
    // Wait for canvas to be ready before initial model draw
    setTimeout(() => {
      switchTarget('space');
    }, 100);
  };

  return (
    <div className="relative w-full h-screen bg-[#000508] text-white font-mono overflow-hidden select-none border-8 border-[#0a1b26]">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-grid z-0" />

      <AnimatePresence>
        {!isEngaged && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="fixed inset-0 z-[100] flex justify-center items-center bg-[radial-gradient(circle_at_center,#0a1824_0%,#000_100%)] p-6"
          >
            <div className="w-full max-w-[960px] bg-[rgba(6,18,26,0.92)] border border-[rgba(0,242,255,0.2)] rounded-[32px] p-[60px_80px] backdrop-blur-[40px] shadow-[0_60px_150px_rgba(0,0,0,1)] flex flex-col items-center">
              <h1 className="text-[48px] tracking-[22px] mb-[45px] font-thin uppercase text-white text-center leading-none">SINGULARITY</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full mb-10">
                <div className="space-y-6">
                  <p className="text-[16px] leading-[1.8] text-white/75 tracking-[0.8px]">
                    Do we live in a simulation? Can we ever create a digital twin of our world that is truly indistinguishable from reality? This project, <span className="hl-glow">SINGULARITY</span>, explores the limits of that very question.
                  </p>
                  <p className="text-[16px] leading-[1.8] text-white/75 tracking-[0.8px]">
                    We are not simulating reality; we are calculating the <span className="hl-glow">computational cost</span> of it. By analyzing data density, we reveal the bits required to reach 100% fidelity at the Planck scale.
                  </p>
                </div>
                
                <div className="flex flex-col justify-between">
                  <div className="flex gap-4">
                    <div className="flex-1 h-[100px] border border-[rgba(0,242,255,0.2)] rounded-2xl bg-black/40 flex flex-col justify-center items-center">
                      <div className="w-1.5 h-1.5 bg-[--ui-teal] rounded-full shadow-[0_0_12px_var(--ui-teal)]"></div>
                      <span className="text-[8px] tracking-[3px] mt-3 opacity-40 uppercase">VACUUM</span>
                    </div>
                    <div className="flex-1 h-[100px] border border-[rgba(0,242,255,0.2)] rounded-2xl bg-black/40 flex flex-col justify-center items-center">
                      <div className="w-[30px] h-[30px] border border-white/30 rounded-full"></div>
                      <span className="text-[8px] tracking-[3px] mt-3 opacity-40 uppercase">ATOMIC</span>
                    </div>
                    <div className="flex-1 h-[100px] border border-[rgba(0,242,255,0.2)] rounded-2xl bg-black/40 flex flex-col justify-center items-center">
                      <div className="w-[30px] h-[30px] border border-white/30 rotate-45"></div>
                      <span className="text-[8px] tracking-[3px] mt-3 opacity-40 uppercase">BIOLOGY</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={engageSimulation}
                    className="w-full bg-[--ui-teal] border-none text-black p-5 rounded-[60px] font-mono text-[14px] tracking-[10px] cursor-pointer uppercase font-bold transition-all duration-400 hover:translate-y-[-3px] hover:shadow-[0_15px_50px_rgba(0,242,255,0.5)] hover:bg-white mt-6"
                  >
                    Decode Reality
                  </button>
                </div>
              </div>
              
              <div className="text-[9px] tracking-[5px] text-[#00f2ff]/30 uppercase">SYSTEM ARCHIVE // INFORMATIONAL FIDELITY BOUNDARY</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={containerRef} className="absolute inset-0 z-1 pointer-events-none" />

      {isEngaged && (
        <>
          {/* Header */}
          <header className="absolute top-0 left-0 w-full h-20 border-b border-[#00f2ff]/20 bg-[#000508]/80 backdrop-blur-md flex items-center justify-between px-10 z-[50]">
            <div className="flex items-center space-x-6">
              <div className="w-3 h-3 bg-[#00f2ff] rounded-full animate-pulse shadow-[0_0_10px_#00f2ff]"></div>
              <div>
                <h1 className="text-2xl tracking-[1.2rem] font-light">SINGULARITY</h1>
                <p className="text-[10px] text-[#00f2ff]/60 tracking-widest uppercase">SYSTEM CORE: OPERATIONAL // V.1.0.0</p>
              </div>
            </div>
            {/* System load metrics removed as requested */}
          </header>

          <main className="flex h-full pt-20 px-10 relative z-10">
            {/* Left Content Area (Result Box) */}
            <section className="flex-1 flex flex-col justify-end pb-24 relative">
              <div className="max-w-lg relative z-10">
                <div className="border-l-4 border-[#00f2ff] pl-6 py-4 bg-gradient-to-r from-[#00f2ff]/10 to-transparent">
                  <div className="text-4xl font-bold tracking-tight mb-2 min-h-[44px]">{bitsText}</div>
                  <div className="text-xs text-[#00f2ff] opacity-80 uppercase tracking-[0.2em] leading-relaxed whitespace-pre-wrap">
                    {logicText}
                  </div>
                </div>
              </div>
            </section>

            {/* Sidebar / Aside */}
            <aside className="w-80 py-12 flex flex-col z-20">
              <div className="text-[10px] text-[#00f2ff]/40 tracking-[0.4rem] uppercase mb-8 ml-4">System Entity Target</div>
              <div className="flex-1 space-y-4 overflow-y-auto scroll-v px-4 pb-12">
                {(Object.keys(DATABASE) as TargetKey[]).map((key) => (
                  <div 
                    key={key} 
                    onClick={() => switchTarget(key)}
                    className={`group relative p-4 border rounded-xl flex items-center space-x-4 cursor-pointer transition-all duration-300 ${
                      currentTarget === key 
                      ? 'border-[#00f2ff] bg-[#00f2ff]/10 opacity-100 shadow-[0_0_20px_rgba(0,242,255,0.1)]' 
                      : 'border-white/10 hover:border-[#00f2ff]/50 bg-white/5 opacity-60'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      currentTarget === key ? 'bg-[#00f2ff] shadow-[0_0_15px_#00f2ff]' : 'border border-white/20'
                    }`}>
                      {key === 'space' && <div className={`w-2 h-2 rounded-full ${currentTarget === key ? 'bg-black' : 'bg-[#00f2ff]'}`}></div>}
                      {key === 'atom' && <div className={`w-6 h-6 border rounded-full ${currentTarget === key ? 'border-black' : 'border-white/40'}`}></div>}
                      {key === 'virus' && <div className={`w-4 h-8 rounded-sm ${currentTarget === key ? 'bg-black/60' : 'bg-[#00f2ff]/40'}`}></div>}
                      {key === 'hydra' && <div className={`w-4 h-8 rounded-[50%_50%_0_0] ${currentTarget === key ? 'bg-black/60' : 'bg-[#00f2ff]/40'}`}></div>}
                      {key === 'bucky' && <div className={`w-5 h-5 rotate-45 ${currentTarget === key ? 'bg-black/40' : 'border border-[#00f2ff]/30'}`}></div>}
                    </div>
                    <div className="flex-1">
                      <div className={`text-[11px] font-bold tracking-widest uppercase transition-colors ${currentTarget === key ? 'text-white' : 'text-white/80'}`}>
                        {key === 'space' ? 'Absolute Space' : 
                         key === 'atom' ? 'Hydrogen Atom' :
                         key === 'virus' ? 'Bacteriophage T4' :
                         key === 'hydra' ? 'Hydra Vulgaris' : 'C60 Fullerene'}
                      </div>
                      <div className={`text-[9px] uppercase tracking-wider ${currentTarget === key ? 'text-[#00f2ff]' : 'text-white/40'}`}>
                        {key === 'space' ? 'ENTROPY: MAX' : 
                         key === 'atom' ? '1s Wavefunction' :
                         key === 'virus' ? 'Genomic Mapping' :
                         key === 'hydra' ? 'Cellular Regen' : 'Lattice Stability'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="mt-6 mx-4 py-4 bg-[#00f2ff] text-black font-bold text-xs tracking-[0.5rem] uppercase rounded-full hover:bg-white transition-all transform hover:scale-105 active:scale-95"
                onClick={() => switchTarget(currentTarget)}
              >
                Recalculate
              </button>
            </aside>
          </main>

          {/* Footer */}
          <footer className="absolute bottom-0 left-0 w-full h-12 flex items-center px-10 justify-between bg-black text-[9px] text-white/30 tracking-widest border-t border-white/5 z-[50]">
            <div className="hidden md:block">EST. RESOLUTION DEPTH: PLANCK SCALE (1.616255 × 10⁻³⁵ m)</div>
            <div>DECODING SEQUENCE ACTIVE...</div>
          </footer>
        </>
      )}
    </div>
  );
}
