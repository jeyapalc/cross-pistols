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

    return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in relative z-10">
            
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

            {/* Target Display Area */}
            <div className="flex-1 min-h-[300px] flex items-center justify-center relative mt-8">
                <TargetDisplay status={status} />
            </div>

            {/* Tactical Status Playback Bar */}
            <div className="hud-border p-4 sm:p-6 mt-8">
                <div className="hud-crosshair-v"></div>
                
                {/* Main Playback Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-8">
                    
                    {/* Status Indicator & Action */}
                    <div className="w-full sm:w-48">
                        {isIdle ? (
                            <button onClick={start} className="group flex items-center space-x-3 w-full hover:bg-white/5 py-2 px-3 transition-colors border border-transparent hover:border-white/10">
                                <div className="w-3 h-3 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
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
                                    {isRunning ? 'ACTIVE' : 'STANDBY'}
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
                        <div className={`font-mono text-xl tracking-wider ${isRunning ? 'text-white' : 'text-neutral-500'}`}>
                            {timeLeft.toFixed(2)}
                        </div>
                        <div className="text-[10px] font-mono tracking-[0.2em] text-emerald-500">
                            TRK ON
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Timecodes/Locations style Data */}
             <div className="grid grid-cols-3 gap-4 pt-6 px-4">
                <div className="flex flex-col space-y-2">
                    <span className="font-mono text-[10px] text-neutral-500">O4:00:34</span>
                    <span className="font-bold uppercase text-xs tracking-widest text-neutral-300">DRILL PAR</span>
                    <div className="font-mono text-[10px] text-neutral-600 leading-relaxed uppercase">
                        SECTOR 1<br/>
                        {drill.parTime.toFixed(2)} SEC<br/>
                        ACTIVE
                    </div>
                </div>
                 <div className="flex flex-col space-y-2">
                    <span className="font-mono text-[10px] text-neutral-500">O4:00:34</span>
                    <span className="font-bold uppercase text-xs tracking-widest text-neutral-300">STAGE PAR</span>
                    <div className="font-mono text-[10px] text-neutral-600 leading-relaxed uppercase">
                        TOTAL REQ<br/>
                        {stage.drills.reduce((acc, d) => acc + d.parTime, 0).toFixed(2)} SEC<br/>
                        PENDING
                    </div>
                </div>
                 <div className="flex flex-col space-y-2">
                    <span className="font-mono text-[10px] text-neutral-500">SYS.ONL</span>
                    <span className="font-bold uppercase text-xs tracking-widest text-neutral-300">TARGET</span>
                    <div className="font-mono text-[10px] text-neutral-600 leading-relaxed uppercase">
                        DP-1 PROFILE<br/>
                        RANDOMIZED EDGE<br/>
                        {drill.startPos || 'PORT ARMS'}
                    </div>
                </div>
            </div>

        </div>
    );
}
