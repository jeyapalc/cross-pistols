import { useState, useEffect, useRef } from 'react';
import { useStageTimer, STATUS } from '../engine/useStageTimer';
import TargetDisplay from './TargetDisplay';

// Clean SVG icon components
const IconRange = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h4l3-9 4 18 3-9h4" />
    </svg>
);
const IconTime = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);
const IconStance = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="4" r="2.5" />
        <line x1="12" y1="6.5" x2="12" y2="15" />
        <line x1="8" y1="10" x2="16" y2="10" />
        <line x1="12" y1="15" x2="8" y2="22" />
        <line x1="12" y1="15" x2="16" y2="22" />
    </svg>
);
const IconRounds = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="2" rx="3" width="12" height="20" />
        <line x1="12" y1="6" x2="12" y2="8" />
        <line x1="12" y1="10" x2="12" y2="12" />
        <line x1="12" y1="14" x2="12" y2="16" />
    </svg>
);
const IconFacings = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
    </svg>
);

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

    const isLastDrill = currentDrillIndex >= stage.drills.length - 1;
    const showManualNext = !stage.autoChain && !isLastDrill;
    const rangeMeters = stage.name.match(/(\d+)\s*m/i)?.[1] || '--';
    const fade = 'transition-all duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]';

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

            {/* ── Drill Stats ── */}
            <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 ${fade} ${isActive ? 'opacity-0 -translate-y-4 pointer-events-none' : ''}`}>
                <StatBlock icon={<IconRange />} label="Range" value={`${rangeMeters}m`} color="emerald" />
                <StatBlock icon={<IconTime />} label="Par Time" value={`${drill.parTime}s`} color="cyan" />
                <StatBlock icon={<IconStance />} label="Stance" value={drill.readyPosition?.toUpperCase() || 'STANDING'} color="rose" />
                <StatBlock icon={<IconRounds />} label="Rounds" value={drill.rounds || '--'} color="violet" />
                {stage.drills.length > 1 && (
                    <StatBlock icon={<IconFacings />} label="Iteration" value={`${currentDrillIndex + 1} / ${stage.drills.length}`} color="amber" />
                )}
            </div>

            {/* ── Target ── */}
            <div className={`${fade} ${isActive ? 'fixed inset-0 z-40' : 'flex-1 min-h-[250px] flex items-center justify-center'}`}>
                <TargetDisplay status={status} expanded={isActive} />
            </div>

            {/* ── Bottom: INITIATE / RESHOOT only (no timer bar when idle) ── */}
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

// Reusable stat block component
function StatBlock({ icon, label, value, color }) {
    const colors = {
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
        rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    };
    return (
        <div className="flex items-center space-x-3 p-3 rounded-sm bg-[#0c0c10] border border-white/5">
            <div className={`w-9 h-9 rounded-full border flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
                {icon}
            </div>
            <div className="flex flex-col min-w-0">
                <span className="font-bold uppercase text-[9px] tracking-widest text-neutral-500">{label}</span>
                <span className="font-mono text-sm text-white truncate">{value}</span>
            </div>
        </div>
    );
}
