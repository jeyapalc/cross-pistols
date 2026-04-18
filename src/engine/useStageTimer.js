import { useState, useEffect, useRef, useCallback } from 'react';
import { audio } from './AudioEngine';

export const STATUS = {
    IDLE: 'IDLE',
    BRIEFING: 'BRIEFING',
    READY_WAIT: 'READY_WAIT',
    CHAIN_WAIT: 'CHAIN_WAIT',   // Auto-chain "BE ALERT" interval
    RUNNING: 'RUNNING',
    FINISHED: 'FINISHED',
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

    const beginRun = (duration) => {
        audio.playStart();
        setStatus(STATUS.RUNNING);
        setTimeLeft(duration);
        startTimeRef.current = Date.now();

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

    // Full start: plays audio briefing → standby → beep → run
    const startDrill = useCallback(async (audioId) => {
        if (!drill) return;
        audio.init();

        if (audioId) {
            setStatus(STATUS.BRIEFING);
            setIsBriefingWarning(false);
            await audio.playScript(audioId, () => setIsBriefingWarning(true));
            setIsBriefingWarning(false);
        }

        setStatus(STATUS.READY_WAIT);
        const standbyTime = 2000 + Math.random() * 2000;
        setTimeout(() => beginRun(drill.parTime), standbyTime);
    }, [drill]);

    // Silent start: no audio, custom standby range, used for auto-chain
    const startSilent = useCallback((standbyRange = [2, 4]) => {
        if (!drill) return;
        audio.init();

        setStatus(STATUS.CHAIN_WAIT);
        const [min, max] = standbyRange;
        const standbyTime = (min + Math.random() * (max - min)) * 1000;

        setTimeout(() => {
            setStatus(STATUS.READY_WAIT);
            // Short ready-wait flash (1s) then beep
            setTimeout(() => beginRun(drill.parTime), 1000);
        }, standbyTime);
    }, [drill]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        if (drill && status === STATUS.IDLE) {
            setTimeLeft(drill.parTime);
        }
    }, [drill, status]);

    return {
        status,
        timeLeft,
        start: startDrill,
        startSilent,
        reset,
        isBriefingWarning,
    };
}
