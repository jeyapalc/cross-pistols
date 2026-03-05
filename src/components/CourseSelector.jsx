import React from 'react';

export default function CourseSelector({ courses, onSelect }) {
    if (!courses || courses.length === 0) {
        return <div className="text-green-800 text-center py-10 font-mono tracking-widest text-sm">[ ERR: NO_CURRICULUM_DATA ]</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {courses.map((course, idx) => (
                <button
                    key={course.id}
                    onClick={() => onSelect(course)}
                    className="relative group bg-black border border-green-800 hover:border-green-400 p-8 text-left transition-all overflow-hidden flex flex-col justify-between min-h-[200px]"
                >
                    {/* Grid background on hover */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:10px_10px] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    {/* Targeting Brackets */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-green-700 group-hover:border-green-400 transition-colors"></div>
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-green-700 group-hover:border-green-400 transition-colors"></div>
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-green-700 group-hover:border-green-400 transition-colors"></div>
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-green-700 group-hover:border-green-400 transition-colors"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold tracking-widest text-green-600 bg-green-900/30 px-2 py-1">
                                MODULE_0{idx + 1}
                            </span>
                            <span className="text-sm font-bold text-green-700 group-hover:text-green-500 transition-colors">
                                [{course.stages?.length || 0} STAGES]
                            </span>
                        </div>

                        <h2 className="text-3xl font-black text-green-500 group-hover:text-green-300 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)] mb-2 uppercase tracking-tight">
                            {course.name}
                        </h2>
                    </div>

                    <div className="relative z-10 w-full flex justify-end mt-8 border-t border-green-900/50 pt-4">
                        <span className="text-green-600 group-hover:text-green-400 font-bold tracking-widest text-sm flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                            INITIALIZE <span className="animate-pulse">_</span>
                        </span>
                    </div>
                </button>
            ))}
        </div>
    );
}
