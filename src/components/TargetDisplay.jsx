import { useState, useEffect } from 'react';
import { STATUS } from '../engine/useStageTimer';

// Preload images to avoid flickering
const TARGET_IMAGES = [
    `${import.meta.env.BASE_URL}target-blue.svg`,
    `${import.meta.env.BASE_URL}target-green.svg`
];

export default function TargetDisplay({ status, fullScreen = false, subtitle = "", isBriefingWarning = false }) {
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
        <div className={`relative flex justify-center items-center perspective-1000 ${fullScreen ? 'fixed inset-0 z-[60] bg-transparent pointer-events-none p-4 pb-48' : 'w-full h-80 mb-8'}`}>
            {/* 3D Container - Bounded tightly to prevent camera-plane clipping during 90deg swing */}
            <div
                className={`transition-transform duration-300 ease-out transform-style-3d ${isFacing ? 'rotate-y-0' : 'rotate-y-90'
                    } ${fullScreen ? 'relative w-full max-w-sm sm:max-w-lg h-[60vh] max-h-[800px]' : 'relative w-56 h-full'}`}
            >
                {/* Target Face */}
                <div className="absolute inset-0 backface-hidden flex items-center justify-center">
                    <img
                        src={targetImage}
                        alt="Shoot Target"
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Highly Visible Cardboard Edge (faces camera when container is rotated 90deg) */}
                <div
                    className="absolute inset-y-4 sm:inset-y-8 left-1/2 w-3 sm:w-6 -ml-[1.5px] sm:-ml-[3px] bg-[#a67c52] border-x border-[#5c3a21] shadow-[0_0_50px_rgba(166,124,82,0.4)] flex flex-col justify-between overflow-hidden"
                    style={{ transform: 'rotateY(-90deg) translateZ(2px)' }}
                >
                    {/* Corrugated lines */}
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="w-full h-[2px] bg-[#5c3a21]/40"></div>
                    ))}
                </div>
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
                <div className="absolute inset-x-4 sm:inset-x-12 bottom-32 sm:bottom-48 flex flex-col items-center justify-center z-30 pointer-events-none p-4">
                    {/* Audio Waveform Simulator */}
                    <div className="flex items-end space-x-1 sm:space-x-2 mb-6 h-12 sm:h-16 opacity-80">
                        {[...Array(24)].map((_, i) => (
                            <div key={i} className="w-1 sm:w-2 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" style={{ height: `${Math.random() * 80 + 20}%`, animationDuration: `${Math.random() * 0.4 + 0.3}s` }}></div>
                        ))}
                    </div>
                    {/* Subtitle Box */}
                    <div className={`hud-border max-w-4xl w-full px-6 py-4 sm:px-8 sm:py-6 backdrop-blur-md transition-colors duration-300 ${isBriefingWarning ? 'border-red-500/80 bg-red-900/40 shadow-[0_0_50px_rgba(239,68,68,0.5)] animate-pulse' : 'border-emerald-500/30 bg-[#060608]/90 shadow-[0_0_30px_rgba(16,185,129,0.15)]'}`}>
                        <div className="hud-crosshair-v"></div>
                        <p className={`text-sm sm:text-xl font-mono font-bold leading-relaxed tracking-wide text-center uppercase drop-shadow-lg transition-colors ${isBriefingWarning ? 'text-red-400' : 'text-emerald-50'}`}>
                            {isBriefingWarning ? ">> BE READY <<" : subtitle}
                        </p>
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
