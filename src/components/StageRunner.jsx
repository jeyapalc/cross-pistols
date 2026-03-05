import { useState } from 'react';
import { useCourseTimer, STATUS } from '../engine/useCourseTimer';
import TargetDisplay from './TargetDisplay';
import { Play, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';

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

    return (
        <div className="flex flex-col h-screen max-w-3xl mx-auto p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                <button
                    onClick={() => { reset(); onBack(); }}
                    className="flex items-center gap-2 text-gray-400 hover:text-white px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Courses
                </button>
                <h1 className="text-2xl font-black text-gray-100 uppercase tracking-wide">{stage.name}</h1>
            </div>

            {/* Briefing Card */}
            <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-gray-700/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <h3 className="text-blue-400 font-black uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Stage Briefing
                </h3>
                <p className="text-lg leading-relaxed text-gray-300 font-medium">
                    {stage.briefing}
                </p>

                {/* Drill Specific Instructions */}
                <div className="mt-6 pt-5 border-t border-gray-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <span className="text-xs font-black uppercase tracking-widest text-orange-400 mb-1 block">
                            Drill {currentDrillIndex + 1} of {stage.drills.length}
                        </span>
                        <p className="font-bold text-xl text-white">
                            {drill.label ? `${drill.label}: ${drill.description}` : drill.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Timer Display Area */}
            <div className="flex-1 flex flex-col justify-center space-y-8 bg-gray-900/50 rounded-3xl p-8 border border-gray-800">

                {/* 3D Target */}
                <div className="w-full flex justify-center">
                    <TargetDisplay status={status} />
                </div>

                {/* Status/Timer Metrics */}
                <div className="text-center relative">

                    {/* Conditional active state backgrounds */}
                    {isRunning && <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full"></div>}
                    {isStandby && <div className="absolute inset-0 bg-yellow-500/10 blur-3xl rounded-full"></div>}
                    {isInterval && <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full"></div>}

                    <div className="relative z-10 flex flex-col items-center">
                        <div className={`text-8xl md:text-[10rem] font-black tabular-nums tracking-tighter leading-none transition-all duration-300 ${isRunning ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-110' :
                                isInterval ? 'text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]' :
                                    isStandby ? 'text-yellow-500' :
                                        isFinished ? 'text-gray-600' : 'text-gray-300'
                            }`}>
                            {timeLeft.toFixed(1)}
                            <span className="text-4xl md:text-6xl font-medium text-gray-600 inline-block align-baseline ml-2">s</span>
                        </div>

                        {/* Meta Timer Info */}
                        <div className="flex gap-8 mt-6 justify-center">
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Par Time</span>
                                <span className="text-xl font-mono text-gray-400 bg-gray-800 px-4 py-1 rounded-lg border border-gray-700">{drill.parTime}s</span>
                            </div>

                            {totalReps > 1 && (
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Repetition</span>
                                    <span className="text-xl font-mono text-blue-400 bg-blue-900/20 px-4 py-1 rounded-lg border border-blue-900/50">
                                        {Math.min(currentRep, totalReps)} <span className="text-gray-500">/</span> {totalReps}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls bottom bar */}
            <div className="grid grid-cols-1 gap-4 pb-8 h-24">
                {isIdle && (
                    <button
                        onClick={start}
                        className="w-full h-full flex items-center justify-center gap-4 text-2xl font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-500 active:scale-[0.98] transition-all rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:shadow-[0_0_40px_rgba(220,38,38,0.5)]"
                    >
                        <Play className="w-8 h-8 fill-current" /> Auto-Start Timer
                    </button>
                )}

                {isFinished && (
                    <div className="flex space-x-4 h-full">
                        <button
                            onClick={reset}
                            className="flex-1 flex flex-col items-center justify-center gap-1 font-bold bg-gray-800 border border-gray-700 rounded-2xl hover:bg-gray-700 hover:border-gray-600 transition-all active:scale-[0.98] text-gray-300"
                        >
                            <RotateCcw className="w-6 h-6 mb-1 text-gray-400" />
                            Restart Drill
                        </button>

                        {currentDrillIndex < stage.drills.length - 1 ? (
                            <button
                                onClick={handleNext}
                                className="flex-[2] flex flex-col items-center justify-center gap-1 font-bold bg-blue-600 rounded-2xl hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50 transition-all active:scale-[0.98]"
                            >
                                <ArrowRight className="w-6 h-6 mb-1" />
                                Next Drill
                            </button>
                        ) : (
                            <button
                                onClick={() => { reset(); onBack(); }}
                                className="flex-[2] flex flex-col items-center justify-center gap-1 font-bold bg-green-600 rounded-2xl hover:bg-green-500 text-white shadow-lg shadow-green-900/50 transition-all active:scale-[0.98]"
                            >
                                <ArrowLeft className="w-6 h-6 mb-1" />
                                Finish Stage
                            </button>
                        )}
                    </div>
                )}

                {(!isIdle && !isFinished) && (
                    <button
                        onClick={reset}
                        className="w-full h-full flex items-center justify-center gap-2 font-bold bg-red-900/30 border border-red-900/50 hover:bg-red-900/50 text-red-500 rounded-2xl transition-all"
                    >
                        <RotateCcw className="w-5 h-5" /> Abort Drill
                    </button>
                )}
            </div>
        </div>
    );
}
