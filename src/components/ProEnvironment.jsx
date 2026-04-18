import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment, Loader } from '@react-three/drei';
import * as THREE from 'three';

const BASE = import.meta.env.BASE_URL;

function GLBScene({ modelPath }) {
    const { scene } = useGLTF(modelPath);

    useEffect(() => {
        // Automatically enable shadows and adjust materials if necessary upon load
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [scene]);

    // Position the background deep into the Z-axis so the camera sits in the parking lot foreground
    // You can independently tweak [x, y, z] and rotation to dial in the perfect framing of the entrance
    return (
        <group position={[0, -3, -35]} rotation={[0, 0, 0]}>
            <primitive object={scene} />
        </group>
    );
}

export default function ProEnvironment({ modelName = 'scene.glb' }) {
    const modelPath = `${BASE}${modelName}`;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
        }}>
            <Canvas
                camera={{ position: [0, 1.5, 5], fov: 60 }}
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: 'high-performance',
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.2
                }}
                shadows
            >
                <color attach="background" args={['#050505']} />
                
                {/* Basic ambient lighting so the model isn't completely dark */}
                <ambientLight intensity={0.4} />
                <directionalLight 
                    position={[10, 20, 10]} 
                    intensity={1.5} 
                    castShadow 
                    shadow-mapSize-width={2048} 
                    shadow-mapSize-height={2048}
                />
                
                {/* Fallback environment map for reflections if the model uses PBR materials */}
                <Environment preset="night" />

                <Suspense fallback={null}>
                    <GLBScene modelPath={modelPath} />
                </Suspense>
            </Canvas>
            <Loader 
                containerStyles={{ zIndex: 50, background: 'rgba(0,0,0,0.8)' }} 
                dataInterpolation={(p) => `Loading Environment Assets: ${p.toFixed(0)}%`}
            />
        </div>
    );
}

// Preload the default scene to avoid mid-drill stutter where possible
useGLTF.preload(`${BASE}711_final.glb`);
