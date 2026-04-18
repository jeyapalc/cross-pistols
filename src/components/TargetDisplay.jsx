import { useState, useEffect } from 'react';
import { STATUS } from '../engine/useStageTimer';

const TARGET_IMAGES = [
    `${import.meta.env.BASE_URL}target-blue.svg`,
    `${import.meta.env.BASE_URL}target-green.svg`
];

export default function TargetDisplay({ status }) {
    const [targetImage, setTargetImage] = useState(TARGET_IMAGES[0]);
    const [isFacing, setIsFacing] = useState(false);

    useEffect(() => {
        if (status === STATUS.READY_WAIT) {
            const randomImg = TARGET_IMAGES[Math.floor(Math.random() * TARGET_IMAGES.length)];
            setTargetImage(randomImg);
            setIsFacing(false);
        } else if (status === STATUS.RUNNING) {
            setIsFacing(true);
        } else {
            setIsFacing(false);
        }
    }, [status]);

    return (
        <div className="relative flex justify-center items-center perspective-1000 w-full h-full min-h-[200px]">
            {/* 3D Target Container */}
            <div
                className={`transition-transform duration-300 ease-out transform-style-3d relative w-48 sm:w-64 h-full max-h-[400px] ${isFacing ? 'rotate-y-0' : 'rotate-y-90'}`}
            >
                {/* Target Face */}
                <div className="absolute inset-0 backface-hidden flex items-center justify-center">
                    <img
                        src={targetImage}
                        alt="Target"
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Cardboard Edge */}
                <div
                    className="absolute inset-y-4 left-1/2 w-3 -ml-[1.5px] bg-[#a67c52] border-x border-[#5c3a21] shadow-[0_0_30px_rgba(166,124,82,0.3)] flex flex-col justify-between overflow-hidden"
                    style={{ transform: 'rotateY(-90deg) translateZ(2px)' }}
                >
                    {[...Array(16)].map((_, i) => (
                        <div key={i} className="w-full h-[2px] bg-[#5c3a21]/40"></div>
                    ))}
                </div>
            </div>

            {/* Status Overlays */}
            {!isFacing && status === STATUS.READY_WAIT && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="hud-border px-6 py-3 border-yellow-500/50 bg-yellow-900/10 backdrop-blur-md">
                        <h2 className="text-lg font-mono font-bold text-yellow-500/80 uppercase animate-pulse tracking-[0.3em]">
                            STANDBY...
                        </h2>
                    </div>
                </div>
            )}

            {!isFacing && status === STATUS.IDLE && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="hud-border px-6 py-4 border-emerald-500/30 bg-emerald-900/20 backdrop-blur-md">
                        <h2 className="text-xl font-black text-emerald-500 uppercase tracking-[0.3em] drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                            SYSTEM READY
                        </h2>
                    </div>
                </div>
            )}
        </div>
    );
}
