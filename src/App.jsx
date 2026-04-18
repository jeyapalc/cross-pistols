import { useState, useEffect } from 'react';
import coursesData from './data/courses.json';
import CourseSelector from './components/CourseSelector';
import StageRunner from './components/StageRunner';

function App() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
      const t = setTimeout(() => setIsReady(true), 1500);
      return () => clearTimeout(t);
  }, []);

  const resetSelection = () => {
    setSelectedCourse(null);
    setSelectedStage(null);
  };

  if (!isReady) {
      return (
          <div className="fixed inset-0 bg-[#0d0d12] flex flex-col items-center justify-center z-50">
              {/* Logo with white background removed via inversion & blend mode */}
              <img 
                  src="/loading-logo.png" 
                  alt="Loading" 
                  className="w-48 h-48 sm:w-64 sm:h-64 object-contain mix-blend-screen invert opacity-80" 
              />
              
              {/* Tactical Loading Bar */}
              <div className="mt-8 w-48 sm:w-64">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-mono tracking-[0.5em] text-neutral-500 uppercase text-[10px]">Initializing System</span>
                    <span className="font-mono text-emerald-500 text-[10px] animate-pulse">ONL</span>
                </div>
                <div className="w-full h-[2px] bg-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-emerald-500 animate-[loadingBar_1.5s_ease-out_forwards]"></div>
                </div>
              </div>
          </div>
      );
  }

  const TopNav = () => (
    <header className="flex justify-between items-end border-b border-white/10 pb-4 mb-12 mt-4 relative">
      {/* Corner crosshairs for navbar */}
      <div className="absolute -left-4 -bottom-[1px] w-4 h-[1px] bg-white/30"></div>
      <div className="absolute -left-[1px] -bottom-4 w-[1px] h-4 bg-white/30"></div>
      <div className="absolute -right-4 -bottom-[1px] w-4 h-[1px] bg-white/30"></div>
      <div className="absolute -right-[1px] -bottom-4 w-[1px] h-4 bg-white/30"></div>

      <div className="flex space-x-8 items-baseline">
        <h1 className="text-4xl font-black tracking-tighter cursor-pointer hover:text-neutral-300 transition-colors" onClick={resetSelection}>
          CROSS PISTOLS
        </h1>
        <nav className="space-x-8 text-xs tracking-[0.25em] text-neutral-400 hidden md:block uppercase font-bold">
          <span className="hover:text-white cursor-pointer transition-colors">Courses</span>
          <span className="hover:text-white cursor-pointer transition-colors">Settings</span>
          <span className="hover:text-white cursor-pointer transition-colors">About</span>
        </nav>
      </div>
    </header>
  );

  // View: Running a Stage
  if (selectedStage) {
    return (
      <div className="min-h-screen text-white p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-5xl">
          <TopNav />
          <StageRunner
            stage={selectedStage}
            onBack={() => setSelectedStage(null)}
          />
        </div>
      </div>
    );
  }

  // View: Selecting a Stage (Inside a Course)
  if (selectedCourse) {
    return (
      <div className="min-h-screen text-white p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-5xl">
          <TopNav />
          
          <div className="flex items-center space-x-4 mb-8 text-neutral-400 text-sm tracking-widest uppercase font-bold">
            <button onClick={resetSelection} className="hover:text-white transition-colors">← Back to Courses</button>
            <span className="text-neutral-600">/</span>
            <span className="text-white">{selectedCourse.name}</span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {selectedCourse.stages.map((stage, idx) => (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage)}
                className="hud-border p-6 text-left hover:bg-white/5 transition-all group text-white"
              >
                <div className="hud-crosshair-v"></div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xl font-bold tracking-tight group-hover:text-neutral-300 uppercase">{stage.name}</span>
                  <span className="text-xs font-mono text-neutral-500 tracking-widest uppercase">
                    Stg {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-neutral-400 text-xs font-mono leading-relaxed line-clamp-2">{stage.briefing}</p>
                
                <div className="mt-6 pt-4 border-t border-white/5 flex gap-4 text-xs font-mono text-neutral-500">
                  <span>{stage.drills.length} DRILL{stage.drills.length > 1 ? 'S' : ''}</span>
                  <span>/</span>
                  <span>{stage.drills.reduce((acc, d) => acc + d.parTime, 0).toFixed(1)}S PAR</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // View: Home / Course Selection
  return (
    <div className="min-h-screen text-white p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl">
        <TopNav />

        <div className="mb-12">
          <h2 className="text-neutral-500 font-mono text-xs uppercase tracking-[0.3em] mb-2">Select Course Module</h2>
          <div className="w-12 h-[1px] bg-white/20"></div>
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
