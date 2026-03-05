import { useState } from 'react';
import coursesData from './data/courses.json';
import CourseSelector from './components/CourseSelector';
import StageRunner from './components/StageRunner';
import { ShieldAlert } from 'lucide-react';

function App() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);

  const resetSelection = () => {
    setSelectedCourse(null);
    setSelectedStage(null);
  };

  // Shared Scanline Background Wrapper
  const TerminalWrapper = ({ children }) => (
    <div className="min-h-screen bg-black text-green-500 font-mono relative overflow-hidden bg-grid-cyber">
      <div className="absolute inset-0 scanlines pointer-events-none"></div>
      <div className="scanline-bar pointer-events-none"></div>

      {/* CRT Vignette */}
      <div className="absolute inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.8)_100%)]"></div>

      <div className="relative z-10 w-full h-full min-h-screen">
        {children}
      </div>
    </div>
  );

  // View: Running a Stage
  if (selectedStage) {
    return (
      <TerminalWrapper>
        <StageRunner
          stage={selectedStage}
          onBack={() => setSelectedStage(null)}
        />
      </TerminalWrapper>
    );
  }

  // View: Selecting a Stage (Inside a Course)
  if (selectedCourse) {
    return (
      <TerminalWrapper>
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">

          {/* Header HUD */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-green-500/30 pb-4">
            <div>
              <button onClick={resetSelection} className="text-green-600 hover:text-green-400 font-bold uppercase tracking-widest text-sm mb-4 block">
                &lt;SYS.BACK&gt;
              </button>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">
                {selectedCourse.name}
              </h1>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-xs text-green-600 uppercase tracking-widest">Available Stages</span>
              <span className="text-2xl font-bold text-green-500">[{selectedCourse.stages.length}]</span>
            </div>
          </div>

          {/* Stage List Grid */}
          <div className="grid grid-cols-1 gap-6">
            {selectedCourse.stages.map((stage, idx) => (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage)}
                className="group relative bg-black border border-green-800 hover:border-green-400 p-6 text-left transition-all overflow-hidden"
              >
                {/* Decoration Corner Brackets */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-green-600 group-hover:border-green-400"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-green-600 group-hover:border-green-400"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-green-500/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <div className="text-xs text-green-600 mb-1 font-bold">DIR_ENTRY_0{idx + 1}</div>
                    <h2 className="text-xl md:text-2xl font-bold uppercase text-green-500 group-hover:text-green-300 drop-shadow-[0_0_2px_rgba(34,197,94,0.3)]">
                      {stage.name}
                    </h2>
                    <p className="text-green-700 mt-2 text-sm leading-relaxed max-w-3xl">
                      {stage.briefing}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center md:flex-col justify-between md:justify-end gap-4 md:text-right border-t md:border-t-0 md:border-l border-green-900 pt-4 md:pt-0 md:pl-6">
                    <div className="flex flex-col">
                      <span className="text-xs text-green-700">DRILL_COUNT</span>
                      <span className="text-2xl font-black text-green-500">0{stage.drills.length}</span>
                    </div>
                    <span className="text-green-600 group-hover:text-green-400 group-hover:translate-x-2 transition-all">
                      EXECUTE &gt;&gt;
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </TerminalWrapper>
    );
  }

  // View: Home / Course Selection
  return (
    <TerminalWrapper>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
        <div className="w-full max-w-5xl space-y-12">

          {/* Massive Hero Header */}
          <div className="flex flex-col items-center justify-center text-center space-y-6 border-b-2 border-green-900 pb-12 relative">
            <div className="absolute top-0 left-0 text-xs text-green-800">SECURE_TERMINAL_V1.4</div>
            <div className="absolute top-0 right-0 text-xs text-green-800">CONNECT_OK</div>

            <ShieldAlert className="w-20 h-20 text-red-600 animate-pulse" strokeWidth={1} />

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase text-red-500 drop-shadow-[0_0_15px_rgba(220,38,38,0.4)]">
              CROSS PISTOLS
            </h1>

            <div className="bg-red-900/20 border border-red-800 px-6 py-2 text-red-500 tracking-[0.3em] text-sm md:text-lg font-bold">
              RCMP COURSE OF FIRE // UNAUTHORIZED ACCESS PROHIBITED
            </div>
          </div>

          <CourseSelector
            courses={coursesData}
            onSelect={setSelectedCourse}
          />

          <div className="text-center text-xs text-green-800 pt-8 animate-pulse">
            AWAITING_INPUT... _
          </div>
        </div>
      </div>
    </TerminalWrapper>
  );
}

export default App;
