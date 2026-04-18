import { useState, useEffect } from 'react';
import { STATUS } from '../engine/useStageTimer';

const TARGET_IMAGES = [
    `${import.meta.env.BASE_URL}target-blue.svg`,
    `${import.meta.env.BASE_URL}target-green.svg`
];

export default function TargetDisplay({ status, expanded = false, pro = false }) {
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

    const containerStyle = expanded
        ? { perspective: '1200px', position: 'fixed', inset: '0', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', pointerEvents: 'none' }
        : { perspective: '1000px', height: '320px', width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' };

    const targetStyle = expanded
        ? { width: 'min(70vw, 500px)', height: 'min(85vh, 900px)', transformStyle: 'preserve-3d', transition: 'transform 0.3s ease-out', transform: isFacing ? 'rotateY(0deg)' : 'rotateY(90deg)' }
        : { width: '220px', height: '300px', transformStyle: 'preserve-3d', transition: 'transform 0.3s ease-out', transform: isFacing ? 'rotateY(0deg)' : 'rotateY(90deg)' };

    return (
        <div style={containerStyle}>
            {/* 3D Target */}
            <div style={{ ...targetStyle, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                        src={targetImage} 
                        alt="Target" 
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain',
                            ...(pro && isFacing ? {
                                filter: 'brightness(0.85) contrast(1.1) sepia(0.08)',
                                dropShadow: '0 8px 30px rgba(0,0,0,0.6)',
                            } : {}),
                        }} 
                    />
                </div>
            </div>

            {/* BE READY — red strobe warning */}
            {status === STATUS.READY_WAIT && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="strobe-warning pointer-events-none">
                        <div className="relative overflow-hidden px-12 py-6 border-2 border-red-500 bg-red-950/60 shadow-[inset_0_0_60px_rgba(220,38,38,0.8),0_0_40px_rgba(220,38,38,0.5)]">
                            <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={{
                                backgroundImage: 'repeating-linear-gradient(-45deg, #000 0, #000 12px, transparent 12px, transparent 24px)'
                            }}></div>
                            <h2 className="relative z-10 text-3xl sm:text-4xl font-black text-white uppercase tracking-[0.4em] drop-shadow-[0_0_15px_rgba(220,38,38,1)]">
                                BE READY
                            </h2>
                        </div>
                    </div>
                </div>
            )}

            {/* BE ALERT — chain wait strobe */}
            {status === STATUS.CHAIN_WAIT && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="strobe-warning pointer-events-none">
                        <div className="relative overflow-hidden px-12 py-6 border-2 border-red-500 bg-red-950/60 shadow-[inset_0_0_60px_rgba(220,38,38,0.8),0_0_40px_rgba(220,38,38,0.5)]">
                            <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={{
                                backgroundImage: 'repeating-linear-gradient(-45deg, #000 0, #000 12px, transparent 12px, transparent 24px)'
                            }}></div>
                            <h2 className="relative z-10 text-3xl sm:text-4xl font-black text-white uppercase tracking-[0.4em] drop-shadow-[0_0_15px_rgba(220,38,38,1)]">
                                BE ALERT
                            </h2>
                        </div>
                    </div>
                </div>
            )}

            {/* SYSTEM READY — only idle, non-expanded */}
            {status === STATUS.IDLE && !expanded && (
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
