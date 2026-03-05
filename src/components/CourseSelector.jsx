import React from 'react';
import { Target, Clock, ShieldAlert } from 'lucide-react';

export default function CourseSelector({ courses, onSelect }) {
    if (!courses || courses.length === 0) {
        return <div className="text-gray-500 text-center py-10">No courses loaded.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
            {courses.map(course => (
                <button
                    key={course.id}
                    onClick={() => onSelect(course)}
                    className="flex flex-col text-left bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 hover:border-red-500/50 hover:bg-gray-800 transition-all group overflow-hidden rounded-2xl relative shadow-xl hover:shadow-red-900/20 active:scale-[0.98]"
                >
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-500 opacity-75 group-hover:opacity-100 transition-opacity"></div>

                    <div className="p-8 w-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-gray-900 rounded-xl max-w-fit shadow-inner">
                                <Target className="w-8 h-8 text-red-500" />
                            </div>
                            <span className="bg-gray-900/50 border border-gray-700 text-gray-300 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-400" />
                                {course.stages?.length || 0} Stages
                            </span>
                        </div>

                        <h2 className="text-2xl font-black text-gray-100 mb-2 group-hover:text-white transition-colors">{course.name}</h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Standard training curriculum comprising {course.stages?.length || 0} stages of fire. Recommended for qualification prep.
                        </p>

                        <div className="inline-flex items-center text-sm font-bold text-red-400 group-hover:text-red-300 transition-colors uppercase tracking-widest gap-2">
                            Load Course
                            <span className="transition-transform group-hover:translate-x-1">→</span>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}
