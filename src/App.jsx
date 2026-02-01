import { useState } from 'react';
import coursesData from './data/courses.json';
import CourseSelector from './components/CourseSelector';
import StageRunner from './components/StageRunner';

function App() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);

  const resetSelection = () => {
    setSelectedCourse(null);
    setSelectedStage(null);
  };

  // View: Running a Stage
  if (selectedStage) {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        <StageRunner
          stage={selectedStage}
          onBack={() => setSelectedStage(null)}
        />
      </div>
    );
  }

  // View: Selecting a Stage (Inside a Course)
  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-sans p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center space-x-4 mb-8">
            <button onClick={resetSelection} className="text-gray-400 hover:text-white">← Courses</button>
            <h1 className="text-3xl font-black tracking-tight">{selectedCourse.name}</h1>
          </div>

          <div className="grid gap-4">
            {selectedCourse.stages.map(stage => (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage)}
                className="bg-gray-800 p-6 rounded-xl text-left border border-gray-700 hover:border-blue-500 hover:bg-gray-750 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold group-hover:text-blue-400">{stage.name}</span>
                  <span className="bg-gray-900 px-3 py-1 rounded text-sm text-gray-400 font-mono">
                    {stage.drills.length} Drill{stage.drills.length > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-gray-500 mt-2 text-sm line-clamp-1">{stage.briefing}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // View: Home / Course Selection
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
            CROSS PISTOLS
          </h1>
          <p className="text-gray-400 text-lg uppercase tracking-widest">RCMP Course of Fire Timer</p>
        </div>

        <CourseSelector
          courses={coursesData}
          onSelect={setSelectedCourse}
        />
      </div>
    </div>
  );
}

export default App;
