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
        <div className="relative w-full h-[95vh] flex justify-center items-center perspective-1000">

            {/* 3D Container - Scale to height */}
            <div
                className={`relative h-full w-[60vh] transition-transform duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] transform-style-3d z-10 ${isFacing ? 'rotate-y-0 scale-100' : 'rotate-y-90 scale-95'
                    }`}
            >
                {/* Image */}
                <div className="absolute inset-0 backface-hidden flex items-center justify-center">
                    <img
                        src={targetImage}
                        alt="Shoot Target"
                        className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                    />
                </div>

                {/* Target Edge (simulating the side of the cardboard) */}
                <div
                    className="absolute inset-0 bg-yellow-900 w-3 h-full left-1/2 -ml-1.5"
                    style={{ transform: 'rotateY(90deg)' }}
                ></div>
            </div>
        </div>
    );
}
