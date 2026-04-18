export default function CourseSelector({ courses, onSelect }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(course => (
                <button
                    key={course.id}
                    onClick={() => onSelect(course)}
                    className="hud-border p-8 text-left hover:bg-white/5 transition-all group text-white relative overflow-hidden"
                >
                    <div className="hud-crosshair-v"></div>
                    
                    {/* Decorative Top Left Indicator */}
                    <div className="absolute top-0 left-0 w-8 h-[2px] bg-neutral-500/50 group-hover:bg-neutral-300 transition-colors"></div>

                    <h2 className="text-3xl font-black text-white group-hover:text-neutral-300 mb-4 uppercase tracking-tighter">{course.name}</h2>
                    
                    <div className="flex items-center space-x-6 text-xs font-mono tracking-widest text-neutral-500">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-neutral-600 mb-1">MODULE</span>
                            <span className="text-white">ACTIVE</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-neutral-600 mb-1">DATA</span>
                            <span>{String(course.stages.length).padStart(2, '0')} STGS</span>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}
