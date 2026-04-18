import { useState, useEffect, useRef } from 'react';
import { useStageTimer, STATUS } from '../engine/useStageTimer';
import TargetDisplay from './TargetDisplay';

export default function StageRunner({ stage, onBack }) {
    const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
    const drill = stage.drills[currentDrillIndex];

    const { status, timeLeft, start, startSilent, reset } = useStageTimer(drill);
    const hasChainedRef = useRef(false);

    const isFinished = status === STATUS.FINISHED;
    const isIdle = status === STATUS.IDLE;
    const isRunning = status === STATUS.RUNNING;
    const isChainWait = status === STATUS.CHAIN_WAIT;
    const isActive = status === STATUS.BRIEFING || status === STATUS.READY_WAIT || isRunning || isChainWait;

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

    return (
        <div className="flex flex-col h-full animate-fade-in w-full space-y-6 relative">

            {/* ── Header ── */}
            <div className={`flex items-center justify-between ${fade} ${isActive ? 'opacity-0 -translate-y-8 pointer-events-none' : ''}`}>
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">{stage.name}</h2>
                    <p className="font-mono text-xs text-neutral-500 mt-1 uppercase tracking-widest">
                        {stage.drills.length > 1 ? `Drill ${currentDrillIndex + 1} of ${stage.drills.length}` : 'Single Drill'}
                        {drill.label ? ` — ${drill.label}` : ''}
                    </p>
                </div>
                <button onClick={onBack} className="font-mono text-xs text-neutral-500 hover:text-white tracking-widest uppercase transition-colors border border-white/10 hover:border-white/30 px-4 py-2">
                    ← Exit
                </button>
            </div>

            {/* ── Drill Pips ── */}
            {stage.drills.length > 1 && (
                <div className={`flex w-full items-center space-x-2 ${fade} ${isActive ? 'opacity-0 -translate-y-4 pointer-events-none' : ''}`}>
                    {stage.drills.map((_, idx) => (
                        <div key={idx} className={`h-1.5 flex-1 max-w-[60px] border transition-all duration-300 ${idx < currentDrillIndex ? 'bg-emerald-500/80 border-emerald-400' : idx === currentDrillIndex ? 'bg-white/20 border-white' : 'bg-transparent border-white/20'}`} />
                    ))}
                </div>
            )}

            {/* ── Drill Info (text-based HUD, no icons) ── */}
            <div className={`hud-border p-5 sm:p-6 ${fade} ${isActive ? 'opacity-0 -translate-y-4 pointer-events-none' : ''}`}>
                <div className="hud-crosshair-v"></div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-8">
                    <div>
                        <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest block mb-1">Range</span>
                        <span className="font-mono text-lg text-white font-bold">{rangeMeters}m</span>
                    </div>
                    <div>
                        <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest block mb-1">Par Time</span>
                        <span className="font-mono text-lg text-white font-bold">{drill.parTime}s</span>
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

            {/* ── Background Countdown Timer (behind target, RUNNING only) ── */}
            {isRunning && (
                <div className="fixed inset-0 z-30 flex items-center justify-center bg-black overflow-hidden">
                    <span
                        className="timer-text"
                        style={{
                            color: timeRatio <= 0.10 ? '#CC2020' : '#1a1a1a',
                            opacity: timeRatio <= 0.10 ? 0.8 : 0.4,
                            transition: 'color 0.5s ease, opacity 0.5s ease',
                        }}
                    >
                        {timeLeft.toFixed(1)}
                    </span>
                </div>
            )}

            {/* ── Target ── */}
            <div className={`${fade} ${isActive ? 'fixed inset-0 z-40' : 'flex-1 min-h-[250px] flex items-center justify-center'}`}>
                <TargetDisplay status={status} expanded={isActive} />
            </div>

            {/* ── Bottom Actions ── */}
            <div className={`${fade} ${isActive ? 'opacity-0 translate-y-8 pointer-events-none' : ''}`}>
                {isIdle && (
                    <button onClick={() => start(drill.audioId || stage.id)} className="group w-full flex items-center justify-center space-x-4 py-4 hud-border bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                        <div className="w-3 h-3 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                        <span className="font-mono tracking-[0.3em] text-base text-emerald-400 group-hover:text-emerald-300 uppercase">Initiate</span>
                    </button>
                )}
                {isFinished && (
                    <div className="flex gap-3">
                        <button onClick={reset} className="flex-1 font-mono tracking-[0.2em] text-sm text-neutral-400 hover:text-white py-3 hud-border bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/30 transition-all text-center uppercase">
                            Reshoot
                        </button>
                        {showManualNext && (
                            <button onClick={handleNext} className="flex-[2] font-mono tracking-[0.2em] text-sm text-emerald-400 hover:text-emerald-300 py-3 hud-border bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40 transition-all text-center uppercase">
                                Continue to Drill {currentDrillIndex + 2} →
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
