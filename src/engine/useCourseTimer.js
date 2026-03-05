import { useState, useEffect, useRef, useCallback } from 'react';
import { audio } from './AudioEngine';

export const STATUS = {
    IDLE: 'IDLE',
    STANDBY: 'STANDBY',   // Random 2-4s before beep
    RUNNING: 'RUNNING',   // Par time active
    INTERVAL: 'INTERVAL', // Wait between reps
    FINISHED: 'FINISHED',
};

export function useCourseTimer(drill) {
    const [status, setStatus] = useState(STATUS.IDLE);
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentRep, setCurrentRep] = useState(1);

    // Total reps needed
    const totalReps = drill?.type === 'reps' && drill?.count ? drill.count : 1;

    // We use a ref for the timer to easily clear it
    const timerRef = useRef(null);
    // Track the precise end time for accuracy rather than relying on setInterval ticks
    const targetEndTimeRef = useRef(0);

    const reset = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setStatus(STATUS.IDLE);
        setTimeLeft(drill?.parTime || 0);
        setCurrentRep(1);
    }, [drill]);

    const startDrill = useCallback(() => {
        if (!drill) return;

        audio.init();

        // Reset everything before starting
        setCurrentRep(1);
        startRep();
    }, [drill]);

    // Extracted out so we can call it repeatedly
    const startRep = useCallback(() => {
        setStatus(STATUS.STANDBY);
        setTimeLeft(drill.parTime); // UI shows full par time during standby

        const standbyDelay = 2000 + (Math.random() * 2000); // 2-4 seconds

        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            executeRunPhase();
        }, standbyDelay);

    }, [drill]);

    const executeRunPhase = useCallback(() => {
        audio.playStart();
        setStatus(STATUS.RUNNING);

        const durationMs = drill.parTime * 1000;
        targetEndTimeRef.current = Date.now() + durationMs;
        setTimeLeft(drill.parTime);

        const updateTimer = () => {
            const now = Date.now();
            const remainingMs = targetEndTimeRef.current - now;

            if (remainingMs <= 0) {
                setTimeLeft(0);
                finishRep();
            } else {
                setTimeLeft(remainingMs / 1000);
                timerRef.current = requestAnimationFrame(updateTimer);
            }
        };

        if (timerRef.current) cancelAnimationFrame(timerRef.current);
        timerRef.current = requestAnimationFrame(updateTimer);

    }, [drill]);

    const finishRep = useCallback(() => {
        audio.playStop();

        setCurrentRep((prevRep) => {
            if (prevRep < totalReps) {
                // More reps to go! Enter interval phase
                setStatus(STATUS.INTERVAL);

                // Set the display to wait time
                const waitTime = drill.interval || 3; // Default 3 sec interval if missing
                targetEndTimeRef.current = Date.now() + (waitTime * 1000);

                const updateIntervalTimer = () => {
                    const now = Date.now();
                    const remainingMs = targetEndTimeRef.current - now;

                    if (remainingMs <= 0) {
                        // Interval done, start next rep
                        startRep();
                    } else {
                        setTimeLeft(remainingMs / 1000);
                        timerRef.current = requestAnimationFrame(updateIntervalTimer);
                    }
                };

                if (timerRef.current) cancelAnimationFrame(timerRef.current);
                timerRef.current = requestAnimationFrame(updateIntervalTimer);

                return prevRep + 1;
            } else {
                // All reps finished
                setStatus(STATUS.FINISHED);
                return prevRep;
            }
        });

    }, [drill, totalReps, startRep]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                cancelAnimationFrame(timerRef.current);
            }
        };
    }, []);

    // Keep initial par time synced if drill changes while idle
    useEffect(() => {
        if (drill && status === STATUS.IDLE) {
            setTimeLeft(drill.parTime);
        }
    }, [drill, status]);

    return {
        status,
        timeLeft,
        currentRep,
        totalReps,
        start: startDrill,
        reset,
    };
}
