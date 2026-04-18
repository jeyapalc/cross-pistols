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
        <div className="relative flex justify-center items-center w-full" style={{ perspective: '1000px', height: '320px' }}>
            {/* 3D Target Container — explicit pixel sizes to prevent any height collapse */}
            <div
                style={{
                    width: '220px',
                    height: '300px',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.3s ease-out',
                    transform: isFacing ? 'rotateY(0deg)' : 'rotateY(90deg)',
                }}
            >
                {/* Target Face */}
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                        src={targetImage}
                        alt="Target"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                </div>

                {/* Cardboard Edge (visible when rotated 90deg) */}
                <div
                    style={{
                        position: 'absolute',
                        top: '16px',
                        bottom: '16px',
                        left: '50%',
                        width: '10px',
                        marginLeft: '-5px',
                        background: '#a67c52',
                        borderLeft: '1px solid #5c3a21',
                        borderRight: '1px solid #5c3a21',
                        boxShadow: '0 0 30px rgba(166,124,82,0.3)',
                        transform: 'rotateY(-90deg) translateZ(2px)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        overflow: 'hidden',
                    }}
                >
                    {[...Array(16)].map((_, i) => (
                        <div key={i} style={{ width: '100%', height: '2px', background: 'rgba(92,58,33,0.4)' }}></div>
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
