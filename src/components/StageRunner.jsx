import { useState, useEffect } from 'react';
import { useCourseTimer, STATUS } from '../engine/useCourseTimer';
import TargetDisplay from './TargetDisplay';
import { Target } from 'lucide-react';

export default function StageRunner({ stage, onBack }) {
    const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
    const drill = stage.drills[currentDrillIndex];

    const { status, timeLeft, currentRep, totalReps, start, reset } = useCourseTimer(drill);

    const isIdle = status === STATUS.IDLE;
    const isFinished = status === STATUS.FINISHED;
    const isRunning = status === STATUS.RUNNING;
    const isStandby = status === STATUS.STANDBY;
    const isInterval = status === STATUS.INTERVAL;

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

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.repeat) return; // Ignore hold-down repeats

            switch (e.key) {
                case ' ': // Spacebar
                    e.preventDefault(); // Prevent scrolling
                    if (isIdle) {
                        start();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    if (!isIdle && !isFinished) {
                        reset(); // Abort
                    } else if (isIdle || isFinished) {
                        reset();
                        onBack(); // Go back to courses if not running
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (isFinished && currentDrillIndex < stage.drills.length - 1) {
                        handleNext();
                    } else if (isIdle && currentDrillIndex < stage.drills.length - 1) {
                        handleNext(); // Allow looking forward before starting
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (isIdle || isFinished) {
                        if (currentDrillIndex > 0) {
                            handlePrev();
                        } else {
                            reset();
                            onBack(); // Exit stage if at first drill
                        }
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isIdle, isFinished, currentDrillIndex, stage.drills.length, start, reset, handleNext, handlePrev, onBack]);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black font-mono text-green-500">
            {/* Massive Background Timer */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden transition-all duration-300 ${isRunning ? 'text-red-900/30' :
                isInterval ? 'text-blue-900/30' :
                    isStandby ? 'text-yellow-600/30' :
                        isFinished ? 'text-green-900/10' : 'text-green-900/20'
                }`}>
                <div className="text-[40vw] font-black leading-none tracking-tighter opacity-80 whitespace-nowrap">
                    {timeLeft.toFixed(1)}
                </div>
            </div>

            {/* Top Bar HUD */}
            <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-start z-20 pointer-events-none">
                <div className="flex flex-col space-y-2 pointer-events-auto">
                    <button
                        onClick={() => { reset(); onBack(); }}
                        className="text-xs font-bold text-green-600 hover:text-green-400 uppercase tracking-widest border border-green-800 bg-black/80 px-4 py-2 hover:bg-green-900/30 transition-colors"
                    >
                        [ ABORT_MISSION ]
                    </button>
                    <div className="bg-black/80 border border-green-800 p-4 max-w-sm backdrop-blur-sm">
                        <div className="text-[10px] text-green-700 font-bold mb-1">CURRENT_OBJ // DIR: {stage.name}</div>
                        <div className="text-sm font-bold text-green-400 leading-tight">
                            {stage.briefing}
                        </div>
                    </div>
                </div>

                <div className="bg-black/80 border border-green-800 p-4 text-right backdrop-blur-sm pointer-events-auto min-w-[200px]">
                    <div className="text-[10px] text-green-700 font-bold mb-1">SYS.STATUS</div>
                    <div className="text-xl font-black uppercase tracking-widest">
                        {isRunning ? <span className="text-red-500 animate-pulse">ENGAGED</span> :
                            isStandby ? <span className="text-yellow-500 animate-pulse">STANDBY</span> :
                                isInterval ? <span className="text-blue-500">INTERVAL</span> :
                                    isFinished ? <span className="text-green-600">COMPLETED</span> :
                                        <span className="text-green-500">AWAITING_INPUT</span>}
                    </div>
                </div>
            </div>

            {/* Bottom HUD */}
            <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 flex flex-col md:flex-row justify-between items-end z-20 pointer-events-none gap-4">

                {/* Left Side: Drill Information */}
                <div className="bg-black/80 border border-green-800 p-4 min-w-[300px] backdrop-blur-sm pointer-events-auto">
                    <div className="text-[10px] text-green-700 font-bold mb-3 flex items-center justify-between">
                        <span>DRILL_SEQUENCE</span>
                        <span className="text-green-500 bg-green-900/30 px-2 py-0.5">[{currentDrillIndex + 1}/{stage.drills.length}]</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-end border-b border-green-900 pb-1">
                            <span className="text-xs text-green-600">REQ_PAR_TIME</span>
                            <span className="text-lg font-bold text-green-400">{drill.parTime}s</span>
                        </div>
                        {totalReps > 1 && (
                            <div className="flex justify-between items-end border-b border-green-900 pb-1">
                                <span className="text-xs text-green-600">CYCLE_REP</span>
                                <span className="text-lg font-bold text-blue-400">{Math.min(currentRep, totalReps)}/{totalReps}</span>
                            </div>
                        )}
                        <div className="text-sm font-bold text-green-300 mt-2">
                            &gt; {drill.label ? `${drill.label}: ${drill.description}` : drill.description}
                        </div>
                    </div>
                </div>

                {/* Right Side: Controls */}
                <div className="flex flex-col items-end gap-2 pointer-events-auto w-full md:w-auto">
                    {isIdle && (
                        <button
                            onClick={start}
                            className="w-full md:w-auto px-8 py-6 text-xl font-black uppercase tracking-widest text-black bg-red-600 hover:bg-red-500 transition-colors border-2 border-red-400 flex items-center justify-center gap-3 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                        >
                            <Target className="w-6 h-6" /> INITIATE_HACK
                        </button>
                    )}

                    {isFinished && (
                        <div className="flex flex-wrap md:flex-nowrap gap-4 w-full md:w-auto">
                            <button
                                onClick={reset}
                                className="flex-1 md:flex-none px-6 py-4 font-bold uppercase tracking-widest border border-green-600 text-green-600 hover:bg-green-900/30 transition-colors"
                            >
                                [ RELOAD_SEQ ]
                            </button>

                            {currentDrillIndex < stage.drills.length - 1 ? (
                                <button
                                    onClick={handleNext}
                                    className="flex-1 md:flex-none px-6 py-4 font-black uppercase tracking-widest bg-green-600 text-black hover:bg-green-500 transition-colors border border-green-400"
                                >
                                    NEXT_DRILL &gt;&gt;
                                </button>
                            ) : (
                                <button
                                    onClick={() => { reset(); onBack(); }}
                                    className="flex-1 md:flex-none px-6 py-4 font-black uppercase tracking-widest bg-green-600 text-black hover:bg-green-500 transition-colors border border-green-400"
                                >
                                    END_MISSION &gt;&gt;
                                </button>
                            )}
                        </div>
                    )}

                    {(!isIdle && !isFinished) && (
                        <button
                            onClick={reset}
                            className="px-6 py-2 text-xs font-bold uppercase tracking-widest border border-red-800 text-red-600 hover:bg-red-900/30 transition-colors mt-4"
                        >
                            [ CANCEL_OP ]
                        </button>
                    )}
                </div>
            </div>

            {/* Center Area: Target */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <TargetDisplay status={status} />
            </div>

            {/* Viewport Corner Reticles */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-green-700 pointer-events-none z-50 mix-blend-screen opacity-50"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-green-700 pointer-events-none z-50 mix-blend-screen opacity-50"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-green-700 pointer-events-none z-50 mix-blend-screen opacity-50"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-green-700 pointer-events-none z-50 mix-blend-screen opacity-50"></div>
        </div>
    );
}
