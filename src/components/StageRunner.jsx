import { useState } from 'react';
import { useStageTimer, STATUS } from '../engine/useStageTimer';
import TargetDisplay from './TargetDisplay';

export default function StageRunner({ stage, onBack }) {
    const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
    const drill = stage.drills[currentDrillIndex];

    const { status, timeLeft, start, reset } = useStageTimer(drill);

    const isFinished = status === STATUS.FINISHED;
    const isIdle = status === STATUS.IDLE;
    const isRunning = status === STATUS.RUNNING;

    const handleNext = () => {
        if (currentDrillIndex < stage.drills.length - 1) {
            setCurrentDrillIndex(prev => prev + 1);
            reset();
        }
    };

    const isLastDrill = currentDrillIndex >= stage.drills.length - 1;
    const nextStageLabel = isLastDrill ? null : `Continue to Drill ${currentDrillIndex + 2}`;

    return (
        <div className="flex flex-col h-full animate-fade-in w-full space-y-6">

            {/* Stage Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">{stage.name}</h2>
                    <p className="font-mono text-xs text-neutral-500 mt-1 uppercase tracking-widest">
                        Drill {currentDrillIndex + 1} of {stage.drills.length}
                    </p>
                </div>
                <button
                    onClick={onBack}
                    className="font-mono text-xs text-neutral-500 hover:text-white tracking-widest uppercase transition-colors border border-white/10 hover:border-white/30 px-4 py-2"
                >
                    ← Exit
                </button>
            </div>

            {/* Drill Progress Pips */}
            {stage.drills.length > 1 && (
                <div className="flex w-full items-center space-x-2">
                    {stage.drills.map((_, idx) => {
                        const isPast = idx < currentDrillIndex;
                        const isCurrent = idx === currentDrillIndex;
                        return (
                            <div key={idx} className={`h-1.5 flex-1 max-w-[60px] border transition-all duration-300 ${isPast ? 'bg-emerald-500/80 border-emerald-400' : isCurrent ? 'bg-white/20 border-white' : 'bg-transparent border-white/20'}`}></div>
                        );
                    })}
                </div>
            )}

            {/* Drill Mechanics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Distance */}
                <div className="flex items-center space-x-3 hud-border p-3 bg-[#09090b]/50 border-white/5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="3" />
                            <line x1="12" y1="2" x2="12" y2="5" />
                            <line x1="12" y1="19" x2="12" y2="22" />
                            <line x1="2" y1="12" x2="5" y2="12" />
                            <line x1="19" y1="12" x2="22" y2="12" />
                        </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold uppercase text-[10px] tracking-widest text-neutral-400">Range</span>
                        <span className="font-mono text-sm text-white">{stage.name.match(/(\d+)\s*m/i)?.[1] || '--'}m</span>
                    </div>
                </div>

                {/* Time */}
                <div className="flex items-center space-x-3 hud-border p-3 bg-[#09090b]/50 border-white/5">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold uppercase text-[10px] tracking-widest text-neutral-400">Par Time</span>
                        <span className="font-mono text-sm text-white">{drill.parTime.toFixed(1)}s</span>
                    </div>
                </div>

                {/* Stance */}
                <div className="flex items-center space-x-3 hud-border p-3 bg-[#09090b]/50 border-white/5">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="5" r="3" />
                            <path d="M12 8v4m-4 6l4-6 4 6" />
                        </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold uppercase text-[10px] tracking-widest text-neutral-400">Stance</span>
                        <span className="font-mono text-sm text-white truncate">{drill.readyPosition?.toUpperCase() || 'STANDING'}</span>
                    </div>
                </div>

                {/* Facings (only for multi-drill stages) */}
                {stage.drills.length > 1 && (
                    <div className="flex items-center space-x-3 hud-border p-3 bg-[#09090b]/50 border-white/5">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-500 flex-shrink-0">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                <polyline points="2 17 12 22 22 17" />
                                <polyline points="2 12 12 17 22 12" />
                            </svg>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold uppercase text-[10px] tracking-widest text-neutral-400">Facings</span>
                            <span className="font-mono text-sm text-white">[{currentDrillIndex + 1}/{stage.drills.length}]</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Target Display */}
            <div className="flex-1 min-h-[250px] flex items-center justify-center">
                <TargetDisplay status={status} />
            </div>

            {/* Bottom Controls */}
            <div className="hud-border p-4 sm:p-5 bg-[#09090b]/30">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                    {/* Left: Action Button */}
                    <div className="w-full sm:w-auto">
                        {isIdle ? (
                            <button onClick={() => start(drill.audioId || stage.id)} className="group flex items-center space-x-3 hover:bg-white/5 py-2 px-4 transition-colors border border-emerald-500/30 hover:border-emerald-500/60">
                                <div className="w-3 h-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                                <span className="font-mono tracking-[0.2em] text-sm text-emerald-400 group-hover:text-emerald-300">INITIATE</span>
                            </button>
                        ) : isFinished ? (
                            <div className="flex space-x-3">
                                <button onClick={reset} className="font-mono tracking-[0.2em] text-xs text-neutral-400 hover:text-white py-2 px-4 border border-white/10 hover:border-white/30 transition-colors">
                                    RESHOOT
                                </button>
                                {nextStageLabel && (
                                    <button onClick={handleNext} className="group flex items-center space-x-2 py-2 px-4 border border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="font-mono tracking-[0.15em] text-xs text-emerald-400">{nextStageLabel}</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3 py-2 px-4">
                                <div className={`w-3 h-3 ${isRunning ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)] animate-pulse'}`}></div>
                                <span className="font-mono tracking-[0.2em] text-sm text-white">
                                    {isRunning ? 'ACTIVE' : status === STATUS.BRIEFING ? 'BRIEFING' : 'STANDBY'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Center: Progress Bar */}
                    <div className="flex-1 w-full bg-white/10 h-[2px] relative">
                        <div
                            className="absolute top-0 left-0 h-full bg-white transition-all duration-[50ms] ease-linear"
                            style={{ width: `${Math.max(0, Math.min(100, (timeLeft / drill.parTime) * 100))}%` }}
                        ></div>
                    </div>

                    {/* Right: Timer */}
                    <div className={`font-mono text-2xl tabular-nums ${isRunning ? 'text-white' : 'text-neutral-500'}`} style={{ letterSpacing: '-0.1em' }}>
                        {timeLeft.toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );
}
