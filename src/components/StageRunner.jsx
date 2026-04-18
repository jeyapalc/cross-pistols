import { useState, useEffect } from 'react';
import { useStageTimer, STATUS } from '../engine/useStageTimer';
import TargetDisplay from './TargetDisplay';

export default function StageRunner({ stage, onBack }) {
    const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
    const drill = stage.drills[currentDrillIndex];

    const { status, timeLeft, start, reset } = useStageTimer(drill);

    const isFinished = status === STATUS.FINISHED;
    const isIdle = status === STATUS.IDLE;
    const isRunning = status === STATUS.RUNNING;
    const isStandby = status === STATUS.READY_WAIT;
    const isBriefing = status === STATUS.BRIEFING;

    // Cinematic Mode = Any active flow state (Briefing, Standby, Running)
    const isCinematicMode = isBriefing || isStandby || isRunning;
    // Standby/Run mode hides even more stuff (like bottom panel during active sequence)
    const isActiveOrStandby = isStandby || isRunning;

    const handleNext = () => {
        if (currentDrillIndex < stage.drills.length - 1) {
            setCurrentDrillIndex(prev => prev + 1);
            reset();
        }
    };

    const handlePrev = () => {
        if (currentDrillIndex > 0) {
            setCurrentDrillIndex(prev => prev - 1);
            reset();
        }
    };

    const hideDistractions = isStandby || isRunning;

    return (
        <div className="flex flex-col h-full animate-fade-in relative z-10 w-full overflow-hidden">
            
            {/* Cinematic Blackout Backdrop */}
            {isCinematicMode && (
                <div className="fixed inset-0 bg-[#060608] z-[55] pointer-events-none transition-opacity duration-[800ms]"></div>
            )}

            {/* Background Giant Timer (Only visible when active or standby) */}
            {isActiveOrStandby && (
                <div className="fixed inset-0 flex items-center justify-center z-[56] pointer-events-none bg-[#09090b] overflow-hidden">
                    <span className="font-mono font-black text-white/5 select-none leading-none" style={{ fontSize: '75vw', marginLeft: '-5vw', letterSpacing: '-0.15em' }}>
                        {isStandby ? drill.parTime.toFixed(1) : timeLeft.toFixed(1)}
                    </span>
                    {drill.type === 'reps' && (
                        <div className="absolute top-8 font-mono text-xl text-white/50 tracking-[0.3em] uppercase">
                            Repetition Based ({drill.count}x)
                        </div>
                    )}
                </div>
            )}

            {/* Distractions Container - Top */}
            <div className={`transition-all duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] w-full flex flex-col space-y-6 flex-shrink-0 ${isCinematicMode ? 'opacity-0 -translate-y-20 pointer-events-none absolute' : 'opacity-100 translate-y-0 relative z-20'}`}>
            
            {/* Round Status Bar (Fighting Game Style) */}
            {stage.drills.length > 1 && (
                <div className="flex w-full items-center justify-center space-x-2 pb-2">
                    {stage.drills.map((_, idx) => {
                        const isPast = idx < currentDrillIndex;
                        const isCurrent = idx === currentDrillIndex;
                        return (
                            <div key={idx} className={`h-1.5 flex-1 max-w-[60px] border transition-all duration-300 relative ${isPast ? 'bg-emerald-500/80 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : isCurrent ? 'bg-white/20 border-white shadow-[0_0_10px_rgba(255,255,255,0.6)] animate-pulse' : 'bg-transparent border-white/20'}`}>
                                {isCurrent && <div className="absolute inset-0 bg-white/40 blur-[2px]"></div>}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Top Info Bar (INFO & CREDITS style) */}
            <div className="hud-border grid sm:grid-cols-2">
                <div className="p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-white/5 relative">
                    <div className="hud-crosshair-v"></div>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold tracking-[0.2em] uppercase text-neutral-300">Stage Details</span>
                        <span className="text-xs font-mono text-neutral-500 tracking-widest">{stage.name}</span>
                    </div>
                    <p className="font-mono text-xs text-neutral-400 leading-relaxed uppercase pr-4">{stage.briefing}</p>
                </div>
                <div className="p-4 sm:p-6 relative">
                    <div className="hud-crosshair-v"></div>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold tracking-[0.2em] uppercase text-neutral-300">Drill Data : {String(currentDrillIndex + 1).padStart(2, '0')}</span>
                        <span className="text-xs font-mono text-neutral-500 tracking-widest">{drill.parTime.toFixed(1)}S PAR</span>
                    </div>
                    <p className="font-mono text-xs text-neutral-400 leading-relaxed uppercase">{drill.label || drill.description}</p>
                </div>
            </div>

            </div>

            {/* Target Display Area */}
            <div className={`flex items-center justify-center relative transition-all duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isCinematicMode ? 'fixed inset-0 z-[60] pointer-events-none' : 'flex-1 min-h-[300px] mt-8 z-0 w-full'}`}>
                <TargetDisplay status={status} fullScreen={isCinematicMode} subtitle={stage.briefing} />
            </div>

            {/* Distractions Container - Bottom */}
            <div className={`transition-all duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] w-full flex flex-col flex-shrink-0 ${isActiveOrStandby ? 'opacity-0 translate-y-20 pointer-events-none absolute bottom-0' : isCinematicMode ? 'fixed inset-x-0 bottom-0 z-[70] p-4 sm:p-6 pb-8 bg-gradient-to-t from-[#060608] via-[#060608]/90 to-transparent' : 'opacity-100 translate-y-0 relative z-20 mt-8'}`}>

            {/* Tactical Status Playback Bar */}
            <div className="hud-border p-4 sm:p-6 mt-8">
                <div className="hud-crosshair-v"></div>
                
                {/* Main Playback Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-8">
                    
                    {/* Status Indicator & Action */}
                    <div className="w-full sm:w-48">
                        {isIdle ? (
                            <button onClick={() => start(stage.id)} className="group flex items-center space-x-3 w-full hover:bg-white/5 py-2 px-3 transition-colors border border-transparent hover:border-white/10">
                                <div className="w-3 h-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                                <span className="font-mono tracking-[0.2em] text-sm group-hover:text-white transition-colors">INITIATE</span>
                            </button>
                        ) : isFinished ? (
                             <div className="flex space-x-2 w-full">
                                <button onClick={reset} className="group flex-1 flex flex-col items-center justify-center hover:bg-white/5 py-2 transition-colors border border-transparent hover:border-white/10">
                                    <span className="font-mono tracking-[0.2em] text-xs text-neutral-400 group-hover:text-white">RESET</span>
                                </button>
                                {currentDrillIndex < stage.drills.length - 1 && (
                                     <button onClick={handleNext} className="group flex-[2] flex items-center justify-center space-x-2 hover:bg-white/5 py-2 transition-colors border border-white/5 hover:border-white/20 bg-white/5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="font-mono tracking-[0.2em] text-xs text-emerald-400 group-hover:text-emerald-300">NEXT DRILL</span>
                                    </button>
                                )}
                             </div>
                        ) : (
                             <div className="flex items-center space-x-3 w-full py-2 px-3">
                                <div className={`w-3 h-3 ${isRunning ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)] animate-pulse'}`}></div>
                                <span className="font-mono tracking-[0.2em] text-sm text-white">
                                    {isRunning ? 'ACTIVE' : status === STATUS.BRIEFING ? 'COMM LINK' : 'STANDBY'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar Line */}
                    <div className="flex-1 w-full bg-white/10 h-[1px] relative">
                         {/* Time Bar Fill */}
                         <div 
                            className="absolute top-0 left-0 h-full bg-white transition-all duration-[50ms] ease-linear" 
                            style={{ width: `${Math.max(0, Math.min(100, (timeLeft / drill.parTime) * 100))}%` }}
                         ></div>
                    </div>

                    {/* Timer Output */}
                    <div className="flex items-center space-x-6 sm:w-48 justify-end">
                        <div className={`font-mono text-xl ${isRunning ? 'text-white' : 'text-neutral-500'}`} style={{ letterSpacing: '-0.1em' }}>
                            {timeLeft.toFixed(2)}
                        </div>
                        <div className="text-[10px] font-mono tracking-[0.2em] text-emerald-500">
                            TRK ON
                        </div>
                    </div>
                </div>
            </div>

            {/* Primary Drill Mechanics Data Blocks */}
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-6 px-4 pb-2">
                
                {/* Distance Block */}
                <div className="flex items-center space-x-3 sm:space-x-4 hud-border p-3 sm:p-4 bg-[#09090b]/50 border-white/5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="3" />
                            <line x1="12" y1="2" x2="12" y2="5" />
                            <line x1="12" y1="19" x2="12" y2="22" />
                            <line x1="2" y1="12" x2="5" y2="12" />
                            <line x1="19" y1="12" x2="22" y2="12" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold uppercase text-[10px] tracking-widest text-neutral-400">Range</span>
                        <span className="font-mono text-sm sm:text-base text-white">{stage.name.match(/(\d+)\s*m/i)?.[1] || stage.name.match(/(\d+)\s*Meters/i)?.[1] || '--'} Meters</span>
                    </div>
                </div>

                {/* Time Block */}
                <div className="flex items-center space-x-3 sm:space-x-4 hud-border p-3 sm:p-4 bg-[#09090b]/50 border-white/5">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold uppercase text-[10px] tracking-widest text-neutral-400">Drill Par Time</span>
                        <span className="font-mono text-sm sm:text-base text-white">{drill.parTime.toFixed(1)} Sec</span>
                    </div>
                </div>

                {/* Stance Block */}
                <div className="flex items-center space-x-3 sm:space-x-4 hud-border p-3 sm:p-4 bg-[#09090b]/50 border-white/5">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                            <path d="M5 22v-5l6-3v-4H7V6h10v4h-4v4l6 3v5" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold uppercase text-[10px] tracking-widest text-neutral-400">Shooter Pos</span>
                        <span className="font-mono text-sm sm:text-base text-white truncate max-w-[120px]" title={drill.readyPosition?.toUpperCase() || 'STANDING'}>
                            {drill.readyPosition?.toUpperCase() || 'STANDING'}
                        </span>
                    </div>
                </div>

                {/* Facings Block (Only rendering if multi-facing targets exist) */}
                {stage.drills.length > 1 && (
                    <div className="flex items-center space-x-3 sm:space-x-4 hud-border p-3 sm:p-4 bg-[#09090b]/50 border-white/5">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-500">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                <polyline points="2 17 12 22 22 17" />
                                <polyline points="2 12 12 17 22 12" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold uppercase text-[10px] tracking-widest text-neutral-400">Facings Sync</span>
                            <span className="font-mono text-sm sm:text-base text-white">[{currentDrillIndex + 1}/{stage.drills.length}] Exec</span>
                        </div>
                    </div>
                )}
            </div>

            </div>

        </div>
    );
}
