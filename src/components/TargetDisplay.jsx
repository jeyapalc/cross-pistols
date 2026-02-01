import { useState, useEffect } from 'react';
import { STATUS } from '../engine/useStageTimer';

// Preload images to avoid flickering
const TARGET_IMAGES = [
    '/target-blue.png',
    '/target-green.png' // Assuming the second uploaded image was renamed to this
];

export default function TargetDisplay({ status }) {
    const [targetImage, setTargetImage] = useState(TARGET_IMAGES[0]);
    const [isFacing, setIsFacing] = useState(false);

    // Status-driven behavior
    useEffect(() => {
        if (status === STATUS.READY_WAIT) {
            // Pick random color during standby
            const randomImg = TARGET_IMAGES[Math.floor(Math.random() * TARGET_IMAGES.length)];
            setTargetImage(randomImg);
            setIsFacing(false); // Ensure it's edged
        } else if (status === STATUS.RUNNING) {
            setIsFacing(true); // Face the shooter
        } else {
            setIsFacing(false); // Edge away (Idle or Finished)
        }
    }, [status]);

    return (
        <div className="relative w-full h-96 flex justify-center items-center perspective-1000">
            {/* 3D Container */}
            <div
                className={`relative w-64 h-full transition-transform duration-300 ease-out transform-style-3d ${isFacing ? 'rotate-y-0' : 'rotate-y-90'
                    }`}
            >
                {/* Target Face */}
                <div className="absolute inset-0 backface-hidden flex items-center justify-center">
                    {/* Shadow for realism */}
                    <div className={`absolute top-4 left-4 w-full h-full bg-black/20 blur-xl rounded-full transition-opacity duration-300 ${isFacing ? 'opacity-100' : 'opacity-0'}`}></div>

                    <img
                        src={targetImage}
                        alt="Shoot Target"
                        className="w-full h-full object-contain filter drop-shadow-2xl"
                    />
                </div>

                {/* Target Edge (simulating the side of the cardboard) */}
                <div
                    className="absolute inset-0 bg-gray-800 w-2 h-full left-1/2 -ml-1"
                    style={{ transform: 'rotateY(90deg)' }}
                ></div>
            </div>

            {/* Fallback/Overlay Text for states where target is edged but info is needed */}
            {!isFacing && status === STATUS.READY_WAIT && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <h2 className="text-4xl font-bold text-yellow-500 uppercase animate-pulse drop-shadow-lg tracking-widest">
                        Standby...
                    </h2>
                </div>
            )}

            {!isFacing && status === STATUS.IDLE && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="bg-red-900/80 border-4 border-red-500 p-6 rounded-xl animate-pulse">
                        <h2 className="text-5xl font-black text-white uppercase tracking-widest">
                            BE ALERT!
                        </h2>
                    </div>
                </div>
            )}
        </div>
    );
}
