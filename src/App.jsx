import { useState } from 'react';
import coursesData from './data/courses.json';
import CourseSelector from './components/CourseSelector';
import StageRunner from './components/StageRunner';
import { Crosshair } from 'lucide-react';

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
      <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-red-500/30">
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
      <div className="min-h-screen bg-gray-900 text-white font-sans p-4 md:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black">
        <div className="max-w-4xl mx-auto space-y-8">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button onClick={resetSelection} className="text-gray-400 hover:text-white transition-colors bg-gray-800/50 hover:bg-gray-800 px-4 py-2 rounded-xl backdrop-blur-sm">
                ← Back to Courses
              </button>
            </div>
          </div>

          <div className="bg-gray-800/40 p-6 md:p-10 rounded-3xl border border-gray-700/50 backdrop-blur shadow-2xl">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 pb-2">
              {selectedCourse.name}
            </h1>
            <p className="text-gray-400 font-medium">Select a stage of fire to begin.</p>

            <div className="grid gap-4 mt-8">
              {selectedCourse.stages.map((stage, idx) => (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStage(stage)}
                  className="bg-gray-800/80 p-6 md:p-8 rounded-2xl text-left border border-gray-700 hover:border-red-500/50 hover:bg-gray-800 transition-all group shadow-lg hover:shadow-red-900/20 active:scale-[0.99] relative overflow-hidden"
                >
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/5 to-red-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-4">
                      <span className="text-xl md:text-2xl font-black group-hover:text-red-400 transition-colors drop-shadow-sm">
                        {stage.name}
                      </span>
                    </div>
                    <span className="bg-gray-900 px-4 py-1.5 rounded-full text-sm text-gray-400 font-bold border border-gray-700/50 shadow-inner group-hover:border-red-900/50 transition-colors">
                      {stage.drills.length} Drill{stage.drills.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-gray-400 mt-2 text-sm md:text-base leading-relaxed line-clamp-2 pr-12 group-hover:text-gray-300">
                    {stage.briefing}
                  </p>

                  {/* Next arrow hint */}
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 group-hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 duration-300">
                    →
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View: Home / Course Selection
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black">

      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none mix-blend-screen"></div>

      <div className="max-w-4xl w-full space-y-12 relative z-10 py-10">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center p-4 bg-gray-800/80 rounded-3xl mb-4 border border-gray-700/50 shadow-2xl shadow-red-900/20">
            <Crosshair className="w-16 h-16 text-red-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-300% animate-gradient-slow drop-shadow-sm pb-2">
            CROSS PISTOLS
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium tracking-[0.2em] uppercase">
            RCMP Course of Fire Timer
          </p>
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
