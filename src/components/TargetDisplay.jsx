import { useState, useEffect } from 'react';
import { STATUS } from '../engine/useCourseTimer';

const TARGET_IMAGES = [
    '/target-blue.png',
    '/target-green.png'
];

export default function TargetDisplay({ status }) {
    const [targetImage, setTargetImage] = useState(TARGET_IMAGES[0]);
    const [isFacing, setIsFacing] = useState(false);

    useEffect(() => {
        if (status === STATUS.STANDBY) {
            const randomImg = TARGET_IMAGES[Math.floor(Math.random() * TARGET_IMAGES.length)];
            setTargetImage(randomImg);
            setIsFacing(false);
        } else if (status === STATUS.RUNNING) {
            setIsFacing(true);
        } else {
            setIsFacing(false);
        }
    }, [status]);

    return (
        <div className="relative w-[400px] h-[500px] flex justify-center items-center" style={{ perspective: '1200px' }}>

            {/* Background HUD Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 transition-all duration-1000 mix-blend-screen">
                <div className={`border-2 rounded-full w-[120%] h-[120%] absolute ${status === STATUS.RUNNING ? 'border-red-500 animate-[spin_10s_linear_infinite]' : 'border-green-500 border-dashed animate-[spin_30s_linear_infinite]'}`}></div>
                <div className={`border border-green-600 rounded-full w-[80%] h-[80%] absolute ${status === STATUS.RUNNING ? 'border-red-600' : ''}`}></div>
                <div className={`w-full h-[1px] absolute ${status === STATUS.RUNNING ? 'bg-red-500/50' : 'bg-green-500/50'}`}></div>
                <div className={`h-full w-[1px] absolute ${status === STATUS.RUNNING ? 'bg-red-500/50' : 'bg-green-500/50'}`}></div>
            </div>

            {/* Target Brackets */}
            <div className="absolute top-10 left-10 w-8 h-8 border-t-4 border-l-4 border-green-500 transition-all duration-500 opacity-80 z-20"></div>
            <div className="absolute top-10 right-10 w-8 h-8 border-t-4 border-r-4 border-green-500 transition-all duration-500 opacity-80 z-20"></div>
            <div className="absolute bottom-10 left-10 w-8 h-8 border-b-4 border-l-4 border-green-500 transition-all duration-500 opacity-80 z-20"></div>
            <div className="absolute bottom-10 right-10 w-8 h-8 border-b-4 border-r-4 border-green-500 transition-all duration-500 opacity-80 z-20"></div>

            {/* 3D Container */}
            <div
                className={`relative w-64 h-[400px] transition-transform duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] transform-style-3d z-10 ${isFacing ? 'rotate-y-0 scale-110' : 'rotate-y-90 scale-95'
                    }`}
            >
                {/* Image */}
                <div className="absolute inset-0 backface-hidden flex items-center justify-center">
                    <img
                        src={targetImage}
                        alt="Shoot Target"
                        className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(0,255,0,0.1)] grayscale mix-blend-screen hue-rotate-180 brightness-150"
                    />

                    {/* Fake HUD overlay on the target surface */}
                    <div className="absolute inset-0 bg-green-500/10 mix-blend-overlay"></div>
                    <div className="absolute top-[30%] w-full h-[2px] bg-red-500/30"></div>
                    <div className="absolute top-[40%] text-[8px] text-red-500 font-bold tracking-widest rotate-90 right-2">CENTER_MASS</div>
                </div>

                <div
                    className="absolute inset-0 bg-green-900 w-2 h-full left-1/2 -ml-1 opacity-50"
                    style={{ transform: 'rotateY(90deg)' }}
                ></div>
            </div>
        </div>
    );
}
