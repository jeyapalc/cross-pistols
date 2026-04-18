import { useState, useEffect, useRef, useCallback } from 'react';
import { audio } from './AudioEngine';

export const STATUS = {
    IDLE: 'IDLE',
    BRIEFING: 'BRIEFING',     // TTS reading standard briefing
    READY_WAIT: 'READY_WAIT', // "Standby..."
    RUNNING: 'RUNNING',       // Drill in progress
    FINISHED: 'FINISHED',     // Par time ended
};

export function useStageTimer(drill) {
    const [status, setStatus] = useState(STATUS.IDLE);
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentRep, setCurrentRep] = useState(1);
    const [isBriefingWarning, setIsBriefingWarning] = useState(false);
    const timerRef = useRef(null);
    const startTimeRef = useRef(0);

    const reset = useCallback(() => {
        setStatus(STATUS.IDLE);
        setTimeLeft(drill?.parTime || 0);
        setCurrentRep(1);
        if (timerRef.current) clearInterval(timerRef.current);
    }, [drill]);

    const startDrill = useCallback(async (stageId) => {
        if (!drill) return;

        audio.init(); // Ensure audio context is ready
        
        if (stageId) {
            setStatus(STATUS.BRIEFING);
            setIsBriefingWarning(false);
            await audio.playScript(stageId, () => setIsBriefingWarning(true));
            setIsBriefingWarning(false);
        }

        // Voice script is done, drop into standard randomized standby sequence
        // which simulates the physical pause between "Be alert" and the tone.
        setStatus(STATUS.READY_WAIT);

        // simple random standby 2-4 seconds
        const standbyTime = 2000 + Math.random() * 2000;

        setTimeout(() => {
            beginRun(drill.parTime);
        }, standbyTime);

    }, [drill]);

    const beginRun = (duration) => {
        audio.playStart();
        setStatus(STATUS.RUNNING);
        setTimeLeft(duration);
        startTimeRef.current = Date.now();

        // Clear any existing interval
        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            const remaining = Math.max(0, duration - elapsed);

            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(timerRef.current);
                finishDrill();
            }
        }, 100);
    };

    const finishDrill = () => {
        audio.playStop();
        setStatus(STATUS.FINISHED);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Update timeLeft when drill changes
    useEffect(() => {
        if (drill && status === STATUS.IDLE) {
            setTimeLeft(drill.parTime);
        }
    }, [drill, status]);

    return {
        status,
        timeLeft,
        start: startDrill,
        reset,
        isBriefingWarning,
    };
}
