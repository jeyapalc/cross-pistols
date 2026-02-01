import { STATUS } from '../engine/useStageTimer';

export default function StatusDisplay({ status, message }) {
    if (status === STATUS.READY_WAIT) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-yellow-900/50 rounded-xl p-8 border-4 border-yellow-500 animate-pulse">
                <span className="text-4xl font-bold text-yellow-500 uppercase">Standby...</span>
            </div>
        );
    }

    if (status === STATUS.RUNNING) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-green-900/50 rounded-xl p-8 border-4 border-green-500">
                <span className="text-6xl font-black text-green-500 uppercase">FIRE</span>
            </div>
        );
    }

    // Implicit "Be Alert" or resting state
    if (message) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-red-900/20 rounded-xl p-8 border-4 border-red-600/50">
                <span className="text-5xl font-bold text-red-500 animate-pulse text-center uppercase tracking-widest leading-tight">
                    {message}
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-800 rounded-xl p-8 border-4 border-gray-700">
            <span className="text-2xl text-gray-500 uppercase">Ready</span>
        </div>
    );
}
