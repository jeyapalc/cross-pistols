import { useState, useEffect, useCallback } from 'react';
import coursesData from './data/courses.json';
import CourseSelector from './components/CourseSelector';
import StageRunner from './components/StageRunner';
import LoginScreen from './components/LoginScreen';
import ProEnvironment from './components/ProEnvironment';
const TopNav = ({ resetSelection, setActiveTab, activeTab }) => (
    <header className="flex justify-between items-end border-b border-white/10 pb-4 mb-12 mt-4 relative">
      <div className="absolute -left-4 -bottom-[1px] w-4 h-[1px] bg-white/30"></div>
      <div className="absolute -left-[1px] -bottom-4 w-[1px] h-4 bg-white/30"></div>
      <div className="absolute -right-4 -bottom-[1px] w-4 h-[1px] bg-white/30"></div>
      <div className="absolute -right-[1px] -bottom-4 w-[1px] h-4 bg-white/30"></div>

      <div className="flex space-x-8 items-baseline w-full justify-between">
        <h1 className="text-4xl font-black tracking-tighter cursor-pointer hover:text-neutral-300 transition-colors" onClick={() => { resetSelection(); setActiveTab('Courses'); }}>
          CROSS PISTOLS
        </h1>
        <nav className="space-x-8 text-xs tracking-[0.25em] text-neutral-400 hidden md:block uppercase font-bold">
          <button onClick={() => { resetSelection(); setActiveTab('Courses'); }} className={`${activeTab === 'Courses' ? 'text-white' : 'hover:text-white'} transition-colors`}>Courses</button>
          <button onClick={() => { resetSelection(); setActiveTab('PRO'); }} className={`${activeTab === 'PRO' ? 'text-emerald-400' : 'hover:text-white'} transition-colors`}>PRO</button>
        </nav>
      </div>
    </header>
);

function App() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState('Courses');
  const [isAuthenticated, setIsAuthenticated] = useState(true); // TEMPORARILY BYPASSED FOR DEV
  const [drillStatus, setDrillStatus] = useState(null);

  // ── Keyboard-focused stage index for arrow key navigation ──
  const [focusedStageIdx, setFocusedStageIdx] = useState(0);

  const handleLogin = () => {
    localStorage.setItem('crossPistolsAuth', 'true');
    setIsAuthenticated(true);
  };

  useEffect(() => {
      const t = setTimeout(() => setIsReady(true), 1500);
      return () => clearTimeout(t);
  }, []);

  const resetSelection = () => {
    setSelectedCourse(null);
    setSelectedStage(null);
    setFocusedStageIdx(0);
  };

  // Reset focus index when entering a course
  useEffect(() => {
    setFocusedStageIdx(0);
  }, [selectedCourse]);

  const displayCourses = activeTab === 'PRO' 
    ? coursesData.filter(c => c.id === 'regular') 
    : coursesData;

  /* ══════════════════════════════════════════════════════
     GLOBAL KEYBOARD NAVIGATION
     ESC: go back one level (stage→course→main menu)
     ←/→: navigate stages when inside a course
     Space/Enter: select focused stage or first course
     ══════════════════════════════════════════════════════ */
  const handleKeyDown = useCallback((e) => {
    // Don't handle keyboard if a drill is running — StageRunner has its own handler
    if (selectedStage) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        if (selectedCourse) {
          // Inside course → back to course list
          setSelectedCourse(null);
          setFocusedStageIdx(0);
        } else if (activeTab === 'PRO') {
          // PRO tab → back to Courses
          setActiveTab('Courses');
        }
        break;

      case 'ArrowLeft':
        e.preventDefault();
        if (selectedCourse) {
          setFocusedStageIdx(prev => Math.max(0, prev - 1));
        }
        break;

      case 'ArrowRight':
        e.preventDefault();
        if (selectedCourse) {
          setFocusedStageIdx(prev => Math.min(selectedCourse.stages.length - 1, prev + 1));
        }
        break;

      case ' ':
      case 'Enter':
        e.preventDefault();
        if (selectedCourse) {
          // Select the focused stage
          const stage = selectedCourse.stages[focusedStageIdx];
          if (stage) setSelectedStage(stage);
        } else if (displayCourses.length > 0) {
          // Auto-select first course
          setSelectedCourse(displayCourses[0]);
        }
        break;

      default:
        break;
    }
  }, [selectedStage, selectedCourse, activeTab, focusedStageIdx, displayCourses]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isReady) {
      return (
          <div className="fixed inset-0 bg-[#0d0d12] flex flex-col items-center justify-center z-50">
              {/* Clean Transparent Logo */}
              <img 
                  src="/loading-logo.png" 
                  alt="Loading" 
                  className="w-48 h-48 sm:w-64 sm:h-64 object-contain opacity-90 drop-shadow-2xl" 
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

  if (!isAuthenticated) {
      return <LoginScreen onLogin={handleLogin} />;
  }



  const renderContent = () => {
      // 1. Running a Stage
      if (selectedStage) {
          return (
              <StageRunner
                  stage={selectedStage}
                  onBack={() => { setSelectedStage(null); setDrillStatus(null); }}
                  isPro={activeTab === 'PRO'}
                  onStatusChange={setDrillStatus}
              />
          );
      }

      // 2. Inside a Course (Selecting a Stage)
      if (selectedCourse) {
          return (
              <div className="animate-fade-in pointer-events-auto">
                  <TopNav resetSelection={resetSelection} setActiveTab={setActiveTab} activeTab={activeTab} />
                  
                  <div className="flex items-center space-x-4 mb-8 text-neutral-400 text-sm tracking-widest uppercase font-bold">
                    <button onClick={() => setSelectedCourse(null)} className="hover:text-white transition-colors">
                        <span className="hidden sm:inline">ESC </span>← Back to Courses
                    </button>
                    <span className="text-neutral-600">/</span>
                    <span className="text-white">{selectedCourse.name}</span>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    {selectedCourse.stages.map((stage, idx) => (
                      <button
                        key={stage.id}
                        onClick={() => setSelectedStage(stage)}
                        className={`p-6 text-left transition-all group text-white relative ${
                          activeTab === 'PRO'
                            ? 'bg-black/50 border border-white/10 hover:border-emerald-500/50 hover:bg-black/80 backdrop-blur-md'
                            : 'hud-border hover:bg-white/5'
                        } ${
                          idx === focusedStageIdx
                            ? 'ring-2 ring-emerald-500/60 ring-offset-1 ring-offset-transparent'
                            : ''
                        }`}
                      >
                        {activeTab !== 'PRO' && <div className="hud-crosshair-v"></div>}
                        <div className="flex justify-between items-start mb-4">
                          <span className={`text-xl font-bold tracking-tight group-hover:text-emerald-400 transition-colors uppercase ${idx === focusedStageIdx ? 'text-emerald-400' : ''}`}>{stage.name}</span>
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

                  {/* Keyboard hints at bottom */}
                  <div className="mt-8 flex justify-center gap-4 text-[10px] font-mono text-neutral-500 uppercase tracking-widest opacity-50">
                    <span className="px-2 py-1 border border-white/10 rounded">← → Select Stage</span>
                    <span className="px-2 py-1 border border-emerald-500/20 rounded text-emerald-600">ENTER Start</span>
                    <span className="px-2 py-1 border border-white/10 rounded">ESC Back</span>
                  </div>
              </div>
          );
      }

      // 3. Home / Course Selection
      return (
          <div className="animate-fade-in pointer-events-auto">
              <TopNav resetSelection={resetSelection} setActiveTab={setActiveTab} activeTab={activeTab} />
              <div className="mb-12">
                  <h2 className="text-neutral-500 font-mono text-xs uppercase tracking-[0.3em] mb-2">
                      {activeTab === 'PRO' ? 'PRO Environments' : 'Select Course Module'}
                  </h2>
                  <div className="w-12 h-[1px] bg-white/20"></div>
              </div>
              <CourseSelector
                  courses={displayCourses}
                  onSelect={setSelectedCourse}
              />

              {/* Keyboard hints */}
              <div className="mt-8 flex justify-center gap-4 text-[10px] font-mono text-neutral-500 uppercase tracking-widest opacity-50">
                <span className="px-2 py-1 border border-emerald-500/20 rounded text-emerald-600">ENTER Select</span>
                {activeTab === 'PRO' && <span className="px-2 py-1 border border-white/10 rounded">ESC Back</span>}
              </div>
          </div>
      );
  };

  return (
    <>
      {activeTab === 'PRO' && (
          <ProEnvironment enableControls={!selectedStage} drillStatus={drillStatus} />
      )}

      {/* Main Overlay UI Layer */}
      <div className="min-h-screen relative z-10 pointer-events-none flex items-center justify-center p-4 sm:p-8 text-white">
        <div className="w-full max-w-5xl">
            {renderContent()}
        </div>
      </div>
    </>
  );
}

export default App;
