import { useState, useEffect } from 'react';
import { STATUS } from '../engine/useStageTimer';

// Preload images to avoid flickering
const TARGET_IMAGES = [
    `${import.meta.env.BASE_URL}target-blue.svg`,
    `${import.meta.env.BASE_URL}target-green.svg`
];

export default function TargetDisplay({ status, fullScreen = false }) {
    const [targetImage, setTargetImage] = useState(TARGET_IMAGES[0]);
    const [isFacing, setIsFacing] = useState(false);

    // Status-driven behavior
    useEffect(() => {
        if (status === STATUS.READY_WAIT) {
            // Pick random color during standby
            const randomImg = TARGET_IMAGES[Math.floor(Math.random() * TARGET_IMAGES.length)];
            setTargetImage(randomImg);
            setIsFacing(false); // Ensure it's edged
        } else if (status === STATUS.RUNNING) {
            setIsFacing(true); // Face the shooter
        } else {
            setIsFacing(false); // Edge away (Idle or Finished)
        }
    }, [status]);

    return (
        <div className={`relative flex justify-center items-center perspective-1000 ${fullScreen ? 'fixed inset-0 z-0 bg-transparent' : 'w-full h-80 mb-8'}`}>
            {/* 3D Container */}
            <div
                className={`transition-transform duration-300 ease-out transform-style-3d ${isFacing ? 'rotate-y-0' : 'rotate-y-90'
                    } ${fullScreen ? 'absolute inset-0 sm:inset-4' : 'relative w-56 h-full'}`}
            >
                {/* Target Face */}
                <div className="absolute inset-0 backface-hidden flex items-center justify-center">
                    {/* Shadow for realism */}
                    <div className={`absolute top-4 left-4 w-full h-full bg-black/40 blur-2xl rounded-full transition-opacity duration-300 ${isFacing ? 'opacity-100' : 'opacity-0'}`}></div>

                    <img
                        src={targetImage}
                        alt="Shoot Target"
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Target Edge (simulating the side of the cardboard) */}
                <div
                    className="absolute inset-0 bg-[#0d0d12] border-y border-white/5 w-1 h-full left-1/2 -ml-[0.5px]"
                    style={{ transform: 'rotateY(90deg)' }}
                ></div>
            </div>

            {/* Fallback/Overlay Text for states where target is edged but info is needed */}
            {!isFacing && status === STATUS.READY_WAIT && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="hud-border px-8 py-4 border-yellow-500/50 bg-yellow-900/10 backdrop-blur-md">
                        <div className="hud-crosshair-v"></div>
                        <h2 className="text-2xl font-mono font-bold text-yellow-500/80 uppercase animate-pulse tracking-[0.3em]">
                            STANDBY...
                        </h2>
                    </div>
                </div>
            )}

            {!isFacing && status === STATUS.BRIEFING && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="hud-border px-8 py-4 border-cyan-500/50 bg-cyan-900/10 backdrop-blur-md">
                        <div className="hud-crosshair-v"></div>
                        <h2 className="text-2xl font-mono font-bold text-cyan-400/80 uppercase animate-pulse tracking-[0.3em]">
                            RANGE COMMANDS...
                        </h2>
                    </div>
                </div>
            )}

            {!isFacing && status === STATUS.IDLE && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="hud-border px-8 py-6 border-emerald-500/30 bg-emerald-900/20 backdrop-blur-md animate-pulse">
                        <div className="hud-crosshair-v"></div>
                        <h2 className="text-3xl font-black text-emerald-500 uppercase tracking-[0.4em] drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                            SYSTEM READY
                        </h2>
                    </div>
                </div>
            )}
        </div>
    );
}
