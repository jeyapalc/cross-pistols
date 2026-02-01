export default function CourseSelector({ courses, onSelect }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            {courses.map(course => (
                <button
                    key={course.id}
                    onClick={() => onSelect(course)}
                    className="flex flex-col items-start p-8 bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-blue-500 rounded-xl transition-all shadow-lg text-left group"
                >
                    <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 mb-2">{course.name}</h2>
                    <span className="text-gray-400 text-sm">{course.stages.length} Stages</span>
                </button>
            ))}
        </div>
    );
}
