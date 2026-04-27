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
        ? { perspective: '1200px', position: 'fixed', inset: '0', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }
        : { perspective: '1000px', height: '320px', width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' };

    const targetStyle = expanded
        ? { width: '100vw', height: '100vh', transformStyle: 'preserve-3d', transition: 'transform 0.3s ease-out', transform: isFacing ? 'rotateY(0deg)' : 'rotateY(90deg)' }
        : { width: '220px', height: '300px', transformStyle: 'preserve-3d', transition: 'transform 0.3s ease-out', transform: isFacing ? 'rotateY(0deg)' : 'rotateY(90deg)' };

    /* ── Warning Triangle SVG (tactical glitch style) ── */
    const WarningTriangle = ({ size = 180 }) => (
        <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 0 30px rgba(220,38,38,0.6)) drop-shadow(0 0 60px rgba(220,38,38,0.3))' }}>
            {/* Outer triangle */}
            <path d="M100 18 L188 172 H12 Z" stroke="#dc2626" strokeWidth="5" fill="none" strokeLinejoin="round"
                style={{ animation: 'trianglePulse 1.5s ease-in-out infinite' }} />
            {/* Inner triangle (glitch offset) */}
            <path d="M100 28 L180 168 H20 Z" stroke="#991b1b" strokeWidth="2" fill="none" strokeLinejoin="round" opacity="0.5"
                style={{ animation: 'triangleGlitch 0.8s steps(2) infinite' }} />
            {/* Corner accents - top */}
            <circle cx="100" cy="18" r="6" fill="#991b1b" opacity="0.8" />
            <path d="M88 34 L100 24 L112 34" stroke="#dc2626" strokeWidth="2" fill="none" opacity="0.6" />
            {/* Corner accents - bottom left */}
            <circle cx="12" cy="172" r="6" fill="#991b1b" opacity="0.8" />
            {/* Corner accents - bottom right */}
            <circle cx="188" cy="172" r="6" fill="#991b1b" opacity="0.8" />
            {/* Halftone dots - top */}
            {[0,1,2,3,4].map(row => (
                Array.from({ length: row + 1 }).map((_, col) => (
                    <circle key={`ht-${row}-${col}`}
                        cx={100 - row * 3 + col * 6}
                        cy={40 + row * 5}
                        r={1.2} fill="#dc2626" opacity={0.5 - row * 0.08}
                    />
                ))
            ))}
            {/* Halftone dots - bottom left */}
            {[0,1,2].map(row => (
                Array.from({ length: 3 - row }).map((_, col) => (
                    <circle key={`bl-${row}-${col}`}
                        cx={24 + col * 5}
                        cy={164 - row * 5}
                        r={1.2} fill="#dc2626" opacity={0.4}
                    />
                ))
            ))}
            {/* Halftone dots - bottom right */}
            {[0,1,2].map(row => (
                Array.from({ length: 3 - row }).map((_, col) => (
                    <circle key={`br-${row}-${col}`}
                        cx={176 - col * 5}
                        cy={164 - row * 5}
                        r={1.2} fill="#dc2626" opacity={0.4}
                    />
                ))
            ))}
            {/* Glitch slashes on triangle edges */}
            <line x1="30" y1="148" x2="50" y2="140" stroke="#dc2626" strokeWidth="4" opacity="0.7"
                style={{ animation: 'slashGlitch 2s ease-in-out infinite' }} />
            <line x1="150" x2="170" y1="140" y2="148" stroke="#dc2626" strokeWidth="4" opacity="0.7"
                style={{ animation: 'slashGlitch 2s ease-in-out infinite reverse' }} />
            {/* Exclamation mark */}
            <rect x="95" y="70" width="10" height="55" rx="3" fill="#dc2626"
                style={{ animation: 'exclamPulse 0.6s ease-in-out infinite alternate' }} />
            <circle cx="100" cy="145" r="7" fill="#dc2626"
                style={{ animation: 'exclamPulse 0.6s ease-in-out infinite alternate' }} />
        </svg>
    );

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
                                // Human breathing + micro-sway when target is facing in PRO
                                animation: 'targetBreath 3.5s ease-in-out infinite, targetSway 8s ease-in-out infinite',
                            } : {}),
                        }} 
                    />
                </div>
            </div>

            {/* ══════════════════════════════════════════════════
                 BE READY — Tactical Warning Triangle
                 Full-screen flashing alert with glitch triangle
                 and written warning underneath.
                 ══════════════════════════════════════════════════ */}
            {status === STATUS.READY_WAIT && (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    zIndex: 10, pointerEvents: 'none',
                }}>
                    {/* Full-screen red pulse overlay */}
                    <div style={{
                        position: 'fixed', inset: 0,
                        background: 'radial-gradient(ellipse at center, rgba(220,38,38,0.08) 0%, transparent 70%)',
                        animation: 'screenPulseRed 1.5s ease-in-out infinite',
                        pointerEvents: 'none',
                    }} />

                    {/* Flashing warning triangle */}
                    <div style={{ animation: 'warningFlash 0.8s ease-in-out infinite' }}>
                        <WarningTriangle size={expanded ? 220 : 160} />
                    </div>

                    {/* BE READY text */}
                    <h2 style={{
                        fontFamily: "monospace",
                        fontSize: expanded ? '2.5rem' : '1.8rem',
                        fontWeight: 900,
                        color: '#dc2626',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4em',
                        marginTop: '1.5rem',
                        textShadow: '0 0 20px rgba(220,38,38,0.8), 0 0 40px rgba(220,38,38,0.4), 0 0 80px rgba(220,38,38,0.2)',
                        animation: 'textFlicker 0.8s ease-in-out infinite',
                        userSelect: 'none',
                    }}>
                        BE READY
                    </h2>

                    {/* Warning subtitle text */}
                    <div style={{
                        marginTop: '0.8rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.3rem',
                    }}>
                        <span style={{
                            fontFamily: 'monospace',
                            fontSize: '0.7rem',
                            color: '#991b1b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3em',
                            animation: 'subtextPulse 1.2s ease-in-out infinite',
                        }}>
                            ⚠ STANDBY FOR ENGAGEMENT ⚠
                        </span>
                        <span style={{
                            fontFamily: 'monospace',
                            fontSize: '0.6rem',
                            color: '#7f1d1d',
                            textTransform: 'uppercase',
                            letterSpacing: '0.25em',
                            opacity: 0.7,
                        }}>
                            WEAPONS FREE ON SIGNAL
                        </span>
                    </div>

                    {/* Scanning line effect */}
                    <div style={{
                        position: 'fixed', inset: 0,
                        pointerEvents: 'none',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute',
                            left: 0, right: 0,
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent, rgba(220,38,38,0.3), rgba(220,38,38,0.6), rgba(220,38,38,0.3), transparent)',
                            animation: 'scanLine 2s linear infinite',
                        }} />
                    </div>
                </div>
            )}

            {/* BE ALERT — chain wait (same triangle style) */}
            {status === STATUS.CHAIN_WAIT && (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    zIndex: 10, pointerEvents: 'none',
                }}>
                    <div style={{
                        position: 'fixed', inset: 0,
                        background: 'radial-gradient(ellipse at center, rgba(220,38,38,0.06) 0%, transparent 70%)',
                        animation: 'screenPulseRed 1.8s ease-in-out infinite',
                        pointerEvents: 'none',
                    }} />
                    <div style={{ animation: 'warningFlash 1s ease-in-out infinite' }}>
                        <WarningTriangle size={expanded ? 200 : 140} />
                    </div>
                    <h2 style={{
                        fontFamily: "monospace",
                        fontSize: expanded ? '2.2rem' : '1.6rem',
                        fontWeight: 900,
                        color: '#dc2626',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4em',
                        marginTop: '1.5rem',
                        textShadow: '0 0 20px rgba(220,38,38,0.8), 0 0 40px rgba(220,38,38,0.4)',
                        animation: 'textFlicker 1s ease-in-out infinite',
                        userSelect: 'none',
                    }}>
                        BE ALERT
                    </h2>
                    <span style={{
                        fontFamily: 'monospace',
                        fontSize: '0.65rem',
                        color: '#991b1b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3em',
                        marginTop: '0.6rem',
                        animation: 'subtextPulse 1.5s ease-in-out infinite',
                    }}>
                        ⚠ NEXT ENGAGEMENT IMMINENT ⚠
                    </span>
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

            {/* CSS Keyframes */}
            <style>{`
                /* Breathing: subtle vertical scale pulse simulating chest rise/fall
                   3.5s cycle ≈ 17 breaths/min (slightly elevated, shooter under stress) */
                @keyframes targetBreath {
                    0%   { transform: scaleY(1.0) scaleX(1.0); }
                    40%  { transform: scaleY(1.008) scaleX(1.003); }
                    60%  { transform: scaleY(1.006) scaleX(1.002); }
                    100% { transform: scaleY(1.0) scaleX(1.0); }
                }
                /* Micro-sway: subtle weight-shift left/right + tiny rotation
                   8s cycle — very slow, barely perceptible */
                @keyframes targetSway {
                    0%   { translate: 0 0;      rotate: 0deg; }
                    25%  { translate: 1.2px 0;  rotate: 0.25deg; }
                    50%  { translate: 0 0;      rotate: 0deg; }
                    75%  { translate: -1.2px 0; rotate: -0.25deg; }
                    100% { translate: 0 0;      rotate: 0deg; }
                }

                /* Warning triangle animations */
                @keyframes warningFlash {
                    0%, 100% { opacity: 1; }
                    50%      { opacity: 0.4; }
                }
                @keyframes trianglePulse {
                    0%, 100% { stroke-opacity: 1; stroke-width: 5; }
                    50%      { stroke-opacity: 0.6; stroke-width: 4; }
                }
                @keyframes triangleGlitch {
                    0%   { transform: translate(0, 0); }
                    25%  { transform: translate(3px, -1px); }
                    50%  { transform: translate(-2px, 2px); }
                    75%  { transform: translate(1px, -2px); }
                    100% { transform: translate(0, 0); }
                }
                @keyframes exclamPulse {
                    0%   { fill: #dc2626; opacity: 0.7; }
                    100% { fill: #ef4444; opacity: 1; }
                }
                @keyframes slashGlitch {
                    0%, 100% { opacity: 0.7; transform: translateX(0); }
                    50%      { opacity: 0.3; transform: translateX(4px); }
                }
                @keyframes textFlicker {
                    0%, 100% { opacity: 1; }
                    40%      { opacity: 0.85; }
                    50%      { opacity: 0.3; }
                    52%      { opacity: 0.9; }
                    60%      { opacity: 0.95; }
                }
                @keyframes subtextPulse {
                    0%, 100% { opacity: 0.5; }
                    50%      { opacity: 1; }
                }
                @keyframes screenPulseRed {
                    0%, 100% { opacity: 0; }
                    50%      { opacity: 1; }
                }
                @keyframes scanLine {
                    0%   { top: -2px; }
                    100% { top: 100%; }
                }
            `}</style>
        </div>
    );
}
