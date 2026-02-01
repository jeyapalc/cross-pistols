import { useState, useEffect } from 'react';
import { useStageTimer, STATUS } from '../engine/useStageTimer';
import TargetDisplay from './TargetDisplay';

export default function StageRunner({ stage, onBack }) {
    const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
    const drill = stage.drills[currentDrillIndex];

    const { status, timeLeft, start, reset } = useStageTimer(drill);

    const isFinished = status === STATUS.FINISHED;
    const isIdle = status === STATUS.IDLE;

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
        <div className="flex flex-col h-full max-w-2xl mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="text-gray-400 hover:text-white px-3 py-2 rounded-lg bg-gray-800">
                    ← Back
                </button>
                <h1 className="text-xl font-bold text-gray-200">{stage.name}</h1>
            </div>

            {/* Briefing Card */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl border-l-4 border-blue-500">
                <h3 className="text-blue-400 font-bold uppercase text-sm mb-2">Stage Briefing</h3>
                <p className="text-lg leading-relaxed text-gray-200">
                    {stage.briefing}
                </p>

                {/* Drill Specific Instructions if multiple */}
                {stage.drills.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <span className="text-sm font-mono text-yellow-400">Drill {currentDrillIndex + 1}/{stage.drills.length}:</span>
                        <p className="font-bold">{drill.label || drill.description}</p>
                    </div>
                )}
            </div>

            {/* Timer / Status Area */}
            <div className="flex-1 flex flex-col justify-center space-y-6">
                <TargetDisplay status={status} />

                <div className="text-center">
                    {/* Timer Display */}
                    <div className={`text-8xl font-black tabular-nums tracking-tighter transition-colors ${status === STATUS.RUNNING ? 'text-red-500 scale-110' :
                        status === STATUS.FINISHED ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                        {timeLeft.toFixed(1)} <span className="text-2xl font-medium text-gray-600">s</span>
                    </div>
                    <div className="text-gray-500 font-mono mt-2">PAR TIME: {drill.parTime}s</div>
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 gap-4 pb-8">
                {isIdle && (
                    <button
                        onClick={start}
                        className="w-full py-6 text-2xl font-black uppercase text-white bg-red-600 hover:bg-red-500 active:scale-95 transition-all rounded-xl shadow-lg shadow-red-900/50"
                    >
                        Start Timer
                    </button>
                )}

                {isFinished && (
                    <div className="flex space-x-4">
                        <button
                            onClick={reset}
                            className="flex-1 py-4 font-bold bg-gray-700 rounded-xl hover:bg-gray-600"
                        >
                            Reset
                        </button>
                        {currentDrillIndex < stage.drills.length - 1 && (
                            <button
                                onClick={handleNext}
                                className="flex-1 py-4 font-bold bg-blue-600 rounded-xl hover:bg-blue-500 text-white"
                            >
                                Next Drill →
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
