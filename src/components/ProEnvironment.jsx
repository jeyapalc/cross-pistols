import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
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

    // Position the background slightly downward and backward so it doesn't clip the target
    return <primitive object={scene} position={[0, -2, -10]} />;
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
        </div>
    );
}

// Preload the default scene to avoid mid-drill stutter where possible
useGLTF.preload(`${BASE}scene.glb`);
