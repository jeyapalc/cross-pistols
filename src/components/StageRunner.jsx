import { useState, useEffect, useRef, useCallback } from 'react';
import { useStageTimer, STATUS } from '../engine/useStageTimer';
import TargetDisplay from './TargetDisplay';

export default function StageRunner({ stage, onBack, isPro = false, onStatusChange }) {
    const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
    const drill = stage.drills[currentDrillIndex];

    const { status, timeLeft, start, startSilent, reset } = useStageTimer(drill);
    const hasChainedRef = useRef(false);

    const isFinished = status === STATUS.FINISHED;
    const isIdle = status === STATUS.IDLE;
    const isRunning = status === STATUS.RUNNING;
    const isChainWait = status === STATUS.CHAIN_WAIT;
    const isBriefing = status === STATUS.BRIEFING;
    // Chrome hides only on standby/running/chain — stays visible during briefing
    const isHidden = status === STATUS.READY_WAIT || isRunning || isChainWait;
    const isActive = isBriefing || isHidden;

    // Report status changes to parent (for ProEnvironment camera)
    useEffect(() => {
        if (onStatusChange) onStatusChange(status);
    }, [status, onStatusChange]);

    const rangeMeters = stage.name.match(/(\d+)\s*m/i)?.[1] || '--';
    const isLastDrill = currentDrillIndex >= stage.drills.length - 1;
    const showManualNext = !stage.autoChain && !isLastDrill;
    const fade = 'transition-all duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]';
    const timeRatio = timeLeft / drill.parTime;

    // Auto-chain logic
    useEffect(() => {
        if (isFinished && stage.autoChain && currentDrillIndex < stage.drills.length - 1 && !hasChainedRef.current) {
            hasChainedRef.current = true;
            const standbyRange = stage.chainStandbyRange || [6, 11];
            setTimeout(() => setCurrentDrillIndex(prev => prev + 1), 500);
            setTimeout(() => { startSilent(standbyRange); hasChainedRef.current = false; }, 700);
        }
    }, [isFinished, stage, currentDrillIndex, startSilent]);

    const handleNext = () => {
        if (currentDrillIndex < stage.drills.length - 1) {
            setCurrentDrillIndex(prev => prev + 1);
            reset();
        }
    };

    /* ── Keyboard Controls ── */
    const handleKeyDown = useCallback((e) => {
        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                onBack();
                break;
            case ' ':
            case 'Enter':
                e.preventDefault();
                if (isIdle) {
                    start(drill.audioId || stage.id);
                } else if (isFinished) {
                    if (showManualNext) {
                        handleNext();
                    } else {
                        reset();
                    }
                }
                break;
            default:
                break;
        }
    }, [isIdle, isFinished, showManualNext, onBack, start, reset, drill, stage]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const formatTime = (t) => {
        const s = Math.max(0, t);
        const secs = Math.floor(s).toString().padStart(2, '0');
        const frac = Math.floor((s % 1) * 10000).toString().padStart(4, '0');
        return `${secs}:${frac.slice(0,2)}:${frac.slice(2,4)}`;
    };


    return (
        <div className="flex flex-col h-full animate-fade-in w-full space-y-6 relative pointer-events-auto">

            {/* ── Header ── */}
            <div className={`flex items-center justify-between ${fade} ${isHidden ? 'opacity-0 -translate-y-8 pointer-events-none' : ''}`}>
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">{stage.name}</h2>
                    <p className="font-mono text-xs text-neutral-500 mt-1 uppercase tracking-widest">
                        {stage.drills.length > 1 ? `Drill ${currentDrillIndex + 1} of ${stage.drills.length}` : 'Single Drill'}
                        {drill.label ? ` — ${drill.label}` : ''}
                    </p>
                </div>
                <button onClick={onBack} className="font-mono text-xs text-neutral-500 hover:text-white tracking-widest uppercase transition-colors border border-white/10 hover:border-white/30 px-4 py-2">
                    <span className="hidden sm:inline">ESC </span>← Exit
                </button>
            </div>

            {/* ── Drill Pips ── */}
            {stage.drills.length > 1 && (
                <div className={`flex w-full items-center space-x-2 ${fade} ${isHidden ? 'opacity-0 -translate-y-4 pointer-events-none' : ''}`}>
                    {stage.drills.map((_, idx) => (
                        <div key={idx} className={`h-1.5 flex-1 max-w-[60px] border transition-all duration-300 ${idx < currentDrillIndex ? 'bg-emerald-500/80 border-emerald-400' : idx === currentDrillIndex ? 'bg-white/20 border-white' : 'bg-transparent border-white/20'}`} />
                    ))}
                </div>
            )}

            {/* ── Drill Info (text-based HUD, no icons) ── */}
            <div className={`hud-border p-5 sm:p-6 ${fade} ${isHidden ? 'opacity-0 -translate-y-4 pointer-events-none' : ''}`}>
                <div className="hud-crosshair-v"></div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-8">
                    <div>
                        <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest block mb-1">Range</span>
                        <span className="font-mono text-lg text-white font-bold">{rangeMeters}m</span>
                    </div>
                    <div>
                        <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest block mb-1">Par Time</span>
                        <span className="font-mono text-lg text-white font-bold">{formatTime(drill.parTime)}</span>
                    </div>
                    <div>
                        <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest block mb-1">Rounds</span>
                        <span className="font-mono text-lg text-white font-bold">{drill.rounds || '--'}</span>
                    </div>
                    <div>
                        <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest block mb-1">Position</span>
                        <span className="font-mono text-lg text-white font-bold">{drill.readyPosition?.toUpperCase() || 'STANDING'}</span>
                    </div>
                </div>
                {drill.description && (
                    <p className="font-mono text-xs text-neutral-500 mt-4 pt-4 border-t border-white/5 uppercase tracking-wider">{drill.description}</p>
                )}
            </div>


            {/* ══════════════════════════════════════════════════════
                 FULL-BLEED COUNTDOWN — Edge-to-edge glass digits
                 Each number is its own frosted-glass panel.
                 Grey-glass → Red-glass at ≤10%. Disappears when finished.
                 ══════════════════════════════════════════════════════ */}
            {isRunning && (() => {
                const danger = timeRatio <= 0.10;
                const chars = formatTime(timeLeft).split('');
                return (
                    <div className={`fixed inset-0 z-30 pointer-events-none ${isPro ? '' : 'bg-black'}`}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100vw',
                            padding: '0 1vw',
                            gap: '0.4vw',
                        }}>
                            {chars.map((char, i) => {
                                const isColon = char === ':';
                                return (
                                    <span key={i} style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontFamily: "'Bebas Neue', 'Anton', 'Teko', sans-serif",
                                        fontVariantNumeric: 'tabular-nums',
                                        userSelect: 'none',
                                        lineHeight: 0.85,
                                        transition: 'color 0.5s ease, text-shadow 0.5s ease, background 0.5s ease, border-color 0.5s ease',
                                        ...(isColon ? {
                                            fontSize: 'min(10vw, 18vh)',
                                            color: danger ? 'rgba(220,50,50,0.25)' : 'rgba(150,155,165,0.10)',
                                            width: '2.5vw',
                                            textShadow: 'none',
                                        } : {
                                            flex: '1 1 0',
                                            maxWidth: '14vw',
                                            fontSize: 'min(18vw, 32vh)',
                                            color: danger ? 'rgba(220,50,50,0.35)' : 'rgba(180,185,195,0.15)',
                                            textShadow: danger
                                                ? '0 0 60px rgba(255,60,60,0.08)'
                                                : '0 0 60px rgba(200,210,230,0.04)',
                                            background: danger
                                                ? 'rgba(220,50,50,0.03)'
                                                : 'rgba(255,255,255,0.015)',
                                            backdropFilter: 'blur(1.5px)',
                                            WebkitBackdropFilter: 'blur(1.5px)',
                                            border: danger
                                                ? '1px solid rgba(220,50,50,0.06)'
                                                : '1px solid rgba(255,255,255,0.03)',
                                            borderRadius: '3px',
                                            padding: '0.5vh 0',
                                        }),
                                    }}>
                                        {char}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* ── Target ── */}
            <div className={`${fade} ${isActive ? 'fixed inset-0 z-40' : 'flex-1 min-h-[250px] flex items-center justify-center'}`}>
                <TargetDisplay status={status} expanded={isActive} pro={isPro && isActive} />
            </div>

            {/* ── Bottom Actions ── */}
            <div className={`${fade} ${isHidden ? 'opacity-0 translate-y-8 pointer-events-none' : ''}`}>
                {isIdle && (
                    <button onClick={() => start(drill.audioId || stage.id)} className="group w-full flex items-center justify-center space-x-4 py-4 hud-border bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                        <div className="w-3 h-3 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                        <span className="font-mono tracking-[0.3em] text-base text-emerald-400 group-hover:text-emerald-300 uppercase">
                            Start
                        </span>
                    </button>
                )}
                {isBriefing && (
                    <div className="w-full flex items-center justify-center space-x-4 py-4 hud-border border-orange-500/30 bg-orange-500/5">
                        <div className="w-3 h-3 bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.7)] animate-pulse" />
                        <span className="font-mono tracking-[0.3em] text-base text-orange-400 uppercase">Briefing</span>
                    </div>
                )}
                {isFinished && (
                    <div className="flex flex-col gap-3">
                        {/* Primary: Continue / Next Stage (pulsing) */}
                        <button
                            onClick={() => showManualNext ? handleNext() : onBack()}
                            className="group w-full flex items-center justify-center space-x-4 py-4 hud-border bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50 transition-all"
                        >
                            <div className="w-3 h-3 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)] animate-pulse" />
                            <span className="font-mono tracking-[0.3em] text-base text-emerald-400 group-hover:text-emerald-300 uppercase">
                                {showManualNext ? `Continue to Drill ${currentDrillIndex + 2}` : 'Continue'}
                            </span>
                            <span className="font-mono text-emerald-600 text-lg">→</span>
                        </button>
                        {/* Secondary: Reshoot */}
                        <button onClick={reset} className="w-full font-mono tracking-[0.2em] text-xs text-neutral-500 hover:text-white py-2.5 border border-white/10 hover:border-white/25 bg-white/[0.03] hover:bg-white/5 transition-all text-center uppercase">
                            Reshoot
                        </button>
                    </div>
                )}
            </div>

            {/* ── Keyboard Hints ── */}
            <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none ${fade} ${isHidden ? 'opacity-0' : 'opacity-60'}`}>
                <div className="flex gap-4 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                    <span className="px-2 py-1 border border-white/10 rounded">ESC Exit</span>
                    {isFinished && <span className="px-2 py-1 border border-white/10 rounded">ENTER Continue</span>}
                </div>
            </div>
        </div>
    );
}
