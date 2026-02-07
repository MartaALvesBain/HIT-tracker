import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, ChevronRight, Check, Plus, Minus, Timer, X, TrendingUp, 
  Dumbbell, FileText, Home, Sparkles, Edit2, Save, Activity, 
  Cloud, CloudOff, RefreshCw, Plane, Trash2, Star
} from 'lucide-react';
import { useGoogleDrive } from './hooks/useGoogleDrive';
import { HOME_ROUTINE, TRAVEL_ROUTINE, STARTING_WEIGHTS } from './data/defaultRoutine';

// Band level names for travel mode
const BAND_LEVELS = ['None', 'Light', 'Medium', 'Heavy', 'X-Heavy'];

// Utility: Check for PR
const checkForPR = (exerciseId, weight, reps, history, side = null) => {
  const previousBests = history
    .flatMap(s => s.exercises)
    .filter(ex => ex.exerciseId === exerciseId)
    .flatMap(ex => ex.sets)
    .filter(set => set.type === 'working' && (side === null || set.side === side));

  if (previousBests.length === 0) return true;
  const maxWeight = Math.max(...previousBests.map(s => s.weight));
  const maxRepsAtMax = Math.max(...previousBests.filter(s => s.weight === maxWeight).map(s => s.reps));
  return weight > maxWeight || (weight === maxWeight && reps > maxRepsAtMax);
};

// Utility: Generate report
const generateReport = (history, routine, trainingMode) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recent = history.filter(h => new Date(h.date) >= thirtyDaysAgo);
  const older = history.filter(h => new Date(h.date) < thirtyDaysAgo);

  const getProgress = (type) => {
    const day = routine[type];
    if (!day) return [];
    return day.exercises.map(ex => {
      const recentSets = recent.flatMap(h => h.exercises).filter(e => e.exerciseId === ex.id).flatMap(e => e.sets).filter(s => s.type === 'working');
      const olderSets = older.flatMap(h => h.exercises).filter(e => e.exerciseId === ex.id).flatMap(e => e.sets).filter(s => s.type === 'working');

      if (recentSets.length === 0) return null;
      const current = recentSets.reduce((best, s) => s.weight > best.weight ? s : best, recentSets[0]);
      const starting = olderSets.length > 0 ? olderSets.reduce((best, s) => s.weight < best.weight ? s : best, olderSets[0]) : recentSets[0];
      const change = current.weight - starting.weight;
      const formatWeight = (w) => ex.id.startsWith('travel-') ? BAND_LEVELS[w] || w : w + 'kg';
      return { name: ex.name, starting: `${formatWeight(starting.weight)} × ${starting.reps}`, current: `${formatWeight(current.weight)} × ${current.reps}`, change, isStall: change === 0, isTravel: ex.id.startsWith('travel-') };
    }).filter(Boolean);
  };

  const legsProgress = getProgress('legs');
  const pushProgress = getProgress('push');
  const pullProgress = getProgress('pull');
  const allStalls = [...legsProgress, ...pushProgress, ...pullProgress].filter(p => p.isStall).map(p => p.name);

  const formatTable = (items) => items.map(p => {
    const changeStr = p.isTravel ? (p.change >= 0 ? '+' + p.change : p.change) + ' level' : (p.change >= 0 ? '+' : '') + p.change + 'kg';
    return `  ${p.name.padEnd(22)} ${p.starting.padEnd(14)} → ${p.current.padEnd(14)} (${changeStr})`;
  }).join('\n');

  const homeSessions = recent.filter(h => h.trainingMode !== 'travel').length;
  const travelSessions = recent.filter(h => h.trainingMode === 'travel').length;

  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       30-DAY PROGRESS REPORT
       Generated: ${new Date().toLocaleDateString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OVERVIEW
────────────────────────────────────────
  Sessions completed    ${recent.length} of 12-13 expected
  Completion rate       ${Math.round((recent.length / 12) * 100)}%
  Personal records      ${recent.flatMap(h => h.exercises).flatMap(e => e.sets).filter(s => s.isPR).length}

WORKOUT DISTRIBUTION
────────────────────────────────────────
  Legs   ${recent.filter(h => h.workoutType === 'legs').length} sessions
  Push   ${recent.filter(h => h.workoutType === 'push').length} sessions
  Pull   ${recent.filter(h => h.workoutType === 'pull').length} sessions
  
  🏠 Home     ${homeSessions} sessions
  ✈️  Travel   ${travelSessions} sessions


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       EXERCISE PROGRESS BY SESSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🦵 LEGS (Sunday)
────────────────────────────────────────
${formatTable(legsProgress) || '  No data yet'}

💪 PUSH (Saturday)
────────────────────────────────────────
${formatTable(pushProgress) || '  No data yet'}

🏋️ PULL (Wednesday)
────────────────────────────────────────
${formatTable(pullProgress) || '  No data yet'}


${allStalls.length > 0 ? `⚠️  STALLED EXERCISES
────────────────────────────────────────
${allStalls.map(s => `  • ${s}`).join('\n')}

Consider: increase reps first, add intensity technique, or swap variation.
` : `✅ NO STALLS — Great progress across all exercises!
`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       CONTEXT FOR AI ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Training style    HIT (Dorian Yates inspired)
  Rep ranges        10-20, controlled tempos
  Goal              Build lean mass safely
  Setting           Home gym + Travel (bands)
  Considerations    Age 47, injury prevention priority
`;
};

// Main App Component
export default function App() {
  // Google Drive
  const { isSignedIn, isLoading: driveLoading, user, signIn, signOut, loadData, saveData } = useGoogleDrive();

  // Training mode
  const [trainingMode, setTrainingMode] = useState('home'); // 'home' or 'travel'

  // Core state
  const [screen, setScreen] = useState('home');
  const [homeRoutine, setHomeRoutine] = useState(HOME_ROUTINE);
  const [travelRoutine, setTravelRoutine] = useState(TRAVEL_ROUTINE);
  const [history, setHistory] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  // Get current routine based on mode
  const routine = trainingMode === 'travel' ? travelRoutine : homeRoutine;
  const setRoutine = trainingMode === 'travel' ? setTravelRoutine : setHomeRoutine;

  // Workout state
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [currentSide, setCurrentSide] = useState('right'); // for unilateral exercises

  // Logging state
  const [logWeight, setLogWeight] = useState(0);
  const [logReps, setLogReps] = useState(12);
  const [logRpe, setLogRpe] = useState(8);
  const [logNote, setLogNote] = useState('');

  // UI state
  const [showPRCelebration, setShowPRCelebration] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [editingExercise, setEditingExercise] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  // Load data on mount
  useEffect(() => {
    const loadLocalData = () => {
      const localHistory = localStorage.getItem('hit-tracker-history');
      const localHomeRoutine = localStorage.getItem('hit-tracker-home-routine');
      const localTravelRoutine = localStorage.getItem('hit-tracker-travel-routine');
      const localMode = localStorage.getItem('hit-tracker-mode');
      if (localHistory) setHistory(JSON.parse(localHistory));
      if (localHomeRoutine) {
        const parsed = JSON.parse(localHomeRoutine);
        // Migration: fix workout days
        if (parsed.legs) parsed.legs.dayOfWeek = 'Sunday';
        if (parsed.push) parsed.push.dayOfWeek = 'Saturday';
        if (parsed.pull) parsed.pull.dayOfWeek = 'Wednesday';
        setHomeRoutine(parsed);
      }
      if (localTravelRoutine) {
        const parsed = JSON.parse(localTravelRoutine);
        // Migration: fix workout days
        if (parsed.legs) parsed.legs.dayOfWeek = 'Sunday';
        if (parsed.push) parsed.push.dayOfWeek = 'Saturday';
        if (parsed.pull) parsed.pull.dayOfWeek = 'Wednesday';
        setTravelRoutine(parsed);
      }
      if (localMode) setTrainingMode(localMode);
    };
    loadLocalData();
  }, []);

  // Sync with Google Drive
  useEffect(() => {
    if (isSignedIn && !driveLoading) {
      syncWithDrive();
    }
  }, [isSignedIn, driveLoading]);

  const syncWithDrive = async () => {
    if (!isSignedIn) return;
    setIsSyncing(true);
    try {
      const cloudData = await loadData();
      if (cloudData) {
        const localHistory = JSON.parse(localStorage.getItem('hit-tracker-history') || '[]');
        const mergedHistory = cloudData.history?.length > localHistory.length ? cloudData.history : localHistory;
        setHistory(mergedHistory);
        if (cloudData.homeRoutine) {
          // Migration: fix workout days
          if (cloudData.homeRoutine.legs) cloudData.homeRoutine.legs.dayOfWeek = 'Sunday';
          if (cloudData.homeRoutine.push) cloudData.homeRoutine.push.dayOfWeek = 'Saturday';
          if (cloudData.homeRoutine.pull) cloudData.homeRoutine.pull.dayOfWeek = 'Wednesday';
          setHomeRoutine(cloudData.homeRoutine);
        }
        if (cloudData.travelRoutine) {
          // Migration: fix workout days
          if (cloudData.travelRoutine.legs) cloudData.travelRoutine.legs.dayOfWeek = 'Sunday';
          if (cloudData.travelRoutine.push) cloudData.travelRoutine.push.dayOfWeek = 'Saturday';
          if (cloudData.travelRoutine.pull) cloudData.travelRoutine.pull.dayOfWeek = 'Wednesday';
          setTravelRoutine(cloudData.travelRoutine);
        }
        await saveData({ history: mergedHistory, homeRoutine: cloudData.homeRoutine || homeRoutine, travelRoutine: cloudData.travelRoutine || travelRoutine });
      } else {
        await saveData({ history, homeRoutine, travelRoutine });
      }
      setLastSynced(new Date());
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-save
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('hit-tracker-history', JSON.stringify(history));
      if (isSignedIn) {
        const timeout = setTimeout(() => {
          saveData({ history, homeRoutine, travelRoutine }).then(() => setLastSynced(new Date()));
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [history, isSignedIn]);

  useEffect(() => {
    localStorage.setItem('hit-tracker-home-routine', JSON.stringify(homeRoutine));
    localStorage.setItem('hit-tracker-travel-routine', JSON.stringify(travelRoutine));
    localStorage.setItem('hit-tracker-mode', trainingMode);
  }, [homeRoutine, travelRoutine, trainingMode]);

  // Rest timer
  useEffect(() => {
    if (restTimeLeft > 0) {
      const timer = setTimeout(() => setRestTimeLeft(restTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [restTimeLeft]);

  // Update log values when exercise/set changes
  useEffect(() => {
    if (currentWorkout?.exercises[currentExerciseIndex]) {
      const ex = currentWorkout.exercises[currentExerciseIndex];
      const set = ex.sets[currentSetIndex];
      if (set) {
        setLogWeight(set.weight || 0);
        setLogReps(set.reps || parseInt(ex.targetReps) || 12);
        setLogRpe(set.rpe || 8);
        setLogNote('');
        // Reset side for unilateral exercises
        if (ex.unilateral && !set.completed) {
          setCurrentSide('right');
        }
      }
    }
  }, [currentWorkout, currentExerciseIndex, currentSetIndex]);

  // Check if exercise is unilateral based on rep scheme
  const isUnilateral = (exercise) => {
    return exercise.unilateral || (exercise.targetReps && exercise.targetReps.toLowerCase().includes('each'));
  };

  // Start workout
  const startWorkout = (type) => {
    const workoutRoutine = routine[type];
    const exercises = workoutRoutine.exercises.map(ex => {
      const unilateral = isUnilateral(ex);
      // For unilateral exercises, we need sets for each side
      const setsPerSide = [
        ...Array(ex.warmupSets).fill(null).map(() => ({ type: 'warmup', weight: null, reps: null, rpe: null, completed: false })),
        ...Array(ex.workingSets).fill(null).map(() => ({ type: 'working', weight: null, reps: null, rpe: null, completed: false }))
      ];
      
      let sets;
      if (unilateral) {
        // Double the sets for unilateral exercises (right then left for each set)
        sets = [];
        setsPerSide.forEach(set => {
          sets.push({ ...set, side: 'right' });
          sets.push({ ...set, side: 'left' });
        });
      } else {
        sets = setsPerSide;
      }

      return {
        ...ex,
        unilateral,
        sets
      };
    });

    // Pre-fill from last same workout type AND same mode
    const lastWorkout = history
      .filter(h => h.workoutType === type && h.trainingMode === trainingMode)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    
    if (lastWorkout) {
      exercises.forEach(ex => {
        const lastEx = lastWorkout.exercises.find(e => e.exerciseId === ex.id);
        if (lastEx) {
          // Track which sets we've already matched to avoid duplicates
          const usedIndices = new Set();
          ex.sets.forEach((set) => {
            // Find matching set from last workout (by type and side)
            const matchingIndex = lastEx.sets.findIndex((s, j) =>
              !usedIndices.has(j) &&
              s.type === set.type &&
              (!set.side || s.side === set.side)
            );
            if (matchingIndex !== -1) {
              usedIndices.add(matchingIndex);
              Object.assign(set, lastEx.sets[matchingIndex], { completed: false });
            }
          });
        }
      });
    }

    const newWorkout = { 
      id: `session-${Date.now()}`, 
      date: new Date().toISOString(), 
      workoutType: type, 
      workoutName: workoutRoutine.name, 
      trainingMode: trainingMode,
      exercises, 
      completed: false 
    };

    setCurrentWorkout(newWorkout);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setCurrentSide('right');

    const firstSet = exercises[0].sets[0];
    setLogWeight(firstSet.weight || STARTING_WEIGHTS[exercises[0].id] || 0);
    setLogReps(firstSet.reps || parseInt(exercises[0].targetReps) || 12);
    setLogRpe(firstSet.rpe || 8);
    setScreen('workout');
  };

  // Log set
  const logSet = () => {
    const updated = JSON.parse(JSON.stringify(currentWorkout));
    const ex = updated.exercises[currentExerciseIndex];
    const set = ex.sets[currentSetIndex];
    
    Object.assign(set, { 
      weight: logWeight, 
      reps: logReps, 
      rpe: logRpe, 
      note: logNote, 
      completed: true,
      side: set.side || null
    });

    if (set.type === 'working' && checkForPR(ex.id, logWeight, logReps, history, set.side)) {
      set.isPR = true;
      setShowPRCelebration(true);
      setTimeout(() => setShowPRCelebration(false), 3000);
    }

    setCurrentWorkout(updated);
    
    // Set rest timer based on what's next
    const nextSet = ex.sets[currentSetIndex + 1];
    if (nextSet && nextSet.side && set.side && nextSet.type === set.type) {
      // Same exercise, switching sides - shortest rest
      setRestTimeLeft(30);
    } else if (nextSet) {
      // Same exercise, next set - medium rest
      setRestTimeLeft(45);
    } else {
      // Moving to next exercise - longer rest
      setRestTimeLeft(60);
    }

    // Move to next set
    if (currentSetIndex < ex.sets.length - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
    } else if (currentExerciseIndex < updated.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
    }
  };

  // Finish workout
  const finishWorkout = () => {
    const completed = {
      ...currentWorkout,
      completed: true,
      exercises: currentWorkout.exercises.map(ex => ({ 
        exerciseId: ex.id, 
        exerciseName: ex.name,
        unilateral: ex.unilateral,
        sets: ex.sets.filter(s => s.completed) 
      }))
    };
    setHistory([...history, completed]);
    setCurrentWorkout(null);
    setScreen('summary');
  };

  // Get stats
  const getStats = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = history.filter(h => new Date(h.date) >= thirtyDaysAgo);
    return {
      totalSessions: recent.length,
      totalPRs: recent.flatMap(h => h.exercises).flatMap(e => e.sets).filter(s => s.isPR).length,
      streak: Math.floor(recent.length / 3)
    };
  };

  // Get exercise history for charts
  const getExerciseHistory = (exerciseId) => {
    return history
      .flatMap(h => h.exercises.map(e => ({ ...e, date: h.date })))
      .filter(e => e.exerciseId === exerciseId)
      .map(e => { const ws = e.sets.find(s => s.type === 'working'); return ws ? { weight: ws.weight, reps: ws.reps } : null; })
      .filter(Boolean).slice(-8);
  };

  // Format weight display
  const formatWeight = (weight, isTravel) => {
    if (isTravel) return BAND_LEVELS[weight] || `Level ${weight}`;
    return `${weight}kg`;
  };

  // Check if current workout is travel mode
  const isCurrentWorkoutTravel = currentWorkout?.trainingMode === 'travel';

  // Delete set from session
  const deleteSetFromSession = (exerciseIndex, setIndex) => {
    if (!editingSession) return;
    const updated = JSON.parse(JSON.stringify(editingSession));
    updated.exercises[exerciseIndex].sets.splice(setIndex, 1);
    setEditingSession(updated);
  };

  // Toggle PR on set
  const togglePROnSet = (exerciseIndex, setIndex) => {
    if (!editingSession) return;
    const updated = JSON.parse(JSON.stringify(editingSession));
    updated.exercises[exerciseIndex].sets[setIndex].isPR = !updated.exercises[exerciseIndex].sets[setIndex].isPR;
    setEditingSession(updated);
  };

  // Save edited session
  const saveEditedSession = () => {
    if (!editingSession) return;
    const updatedHistory = history.map(h => h.id === editingSession.id ? editingSession : h);
    setHistory(updatedHistory);
    setEditingSession(null);
  };

  // Delete entire session
  const deleteSession = (sessionId) => {
    if (confirm('Delete this entire session?')) {
      setHistory(history.filter(h => h.id !== sessionId));
      setEditingSession(null);
    }
  };

  // Color maps
  const colors = {
    legs: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    push: { bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
    pull: { bg: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' }
  };

  // ========== HOME SCREEN ==========
  if (screen === 'home') {
    const stats = getStats();
    const today = new Date().getDay();
    const suggested = today === 0 ? 'legs' : today === 6 ? 'push' : today === 3 ? 'pull' : null;

    return (
      <div className="min-h-screen bg-stone-50">
        <div className="px-5 pt-8 pb-28 safe-top">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity size={18} className="text-stone-400" />
                <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">HIT Tracker</span>
              </div>
              <h1 className="text-3xl font-bold text-stone-800">Week {Math.ceil(stats.totalSessions / 3) || 1}</h1>
            </div>

            {/* Sync Status */}
            <button onClick={() => setShowSettings(true)} className="relative p-2">
              {isSignedIn ? (
                <>
                  {isSyncing ? (
                    <RefreshCw size={20} className="text-stone-400 animate-spin" />
                  ) : (
                    <Cloud size={20} className="text-emerald-500" />
                  )}
                  {user?.picture && (
                    <img src={user.picture} alt="" className="w-6 h-6 rounded-full absolute -bottom-1 -right-1 border-2 border-white" />
                  )}
                </>
              ) : (
                <CloudOff size={20} className="text-stone-300" />
              )}
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-stone-200 rounded-xl p-1 mb-6">
            <button
              onClick={() => setTrainingMode('home')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
                trainingMode === 'home' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'
              }`}
            >
              🏠 Home
            </button>
            <button
              onClick={() => setTrainingMode('travel')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
                trainingMode === 'travel' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'
              }`}
            >
              <Plane size={16} />
              Travel
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-3 mb-8">
            <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
              <p className="text-3xl font-bold text-stone-800 tabular-nums">{stats.totalSessions}</p>
              <p className="text-xs text-stone-400 mt-1">sessions</p>
            </div>
            <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
              <p className="text-3xl font-bold text-amber-500 tabular-nums">{stats.totalPRs}</p>
              <p className="text-xs text-stone-400 mt-1">PRs</p>
            </div>
            <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
              <p className="text-3xl font-bold text-stone-800 tabular-nums">{stats.streak}</p>
              <p className="text-xs text-stone-400 mt-1">weeks</p>
            </div>
          </div>

          {/* Mode indicator */}
          <div className={`flex items-center gap-2 mb-3 ${trainingMode === 'travel' ? 'text-sky-600' : 'text-stone-400'}`}>
            {trainingMode === 'travel' ? <Plane size={14} /> : <span>🏠</span>}
            <span className="text-xs font-medium uppercase tracking-wider">
              {trainingMode === 'travel' ? 'Travel Mode — Bands Only' : 'Home Mode — Dumbbells + Bands'}
            </span>
          </div>

          {/* Workouts */}
          <div className="space-y-3 mb-10">
            {['legs', 'pull', 'push'].map(key => {
              const day = routine[key];
              const c = colors[key];
              const isSuggested = suggested === key;

              return (
                <button
                  key={key}
                  onClick={() => startWorkout(key)}
                  className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] ${
                    isSuggested ? `${c.bg} text-white shadow-lg` : 'bg-white border border-stone-200 text-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isSuggested ? 'bg-white/20' : c.light}`}>
                      <Dumbbell className={isSuggested ? 'text-white' : c.text} size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{day.name}</p>
                      <p className={`text-sm ${isSuggested ? 'text-white/70' : 'text-stone-400'}`}>{day.dayOfWeek}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className={isSuggested ? 'text-white/70' : 'text-stone-300'} />
                </button>
              );
            })}
          </div>

          {/* Recent Sessions */}
          {history.length > 0 && (
            <>
              <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Recent Sessions</h2>
              <div className="space-y-2">
                {history.slice(-5).reverse().map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setEditingSession(session)}
                    className="w-full bg-white rounded-xl p-3 border border-stone-100 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${colors[session.workoutType]?.light || 'bg-stone-100'} flex items-center justify-center`}>
                        <Dumbbell size={14} className={colors[session.workoutType]?.text || 'text-stone-500'} />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-stone-800">{session.workoutName}</p>
                          {session.trainingMode === 'travel' && <Plane size={10} className="text-sky-500" />}
                          {session.exercises.flatMap(e => e.sets).some(s => s.isPR) && <Star size={10} className="text-amber-500 fill-amber-500" />}
                        </div>
                        <p className="text-xs text-stone-400">
                          {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <Edit2 size={14} className="text-stone-300" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-fade-in" onClick={() => setShowSettings(false)}>
            <div className="bg-white rounded-t-3xl w-full p-5 animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-stone-800">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="text-stone-400"><X size={22} /></button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Cloud size={20} className={isSignedIn ? 'text-emerald-500' : 'text-stone-400'} />
                    <div>
                      <p className="font-medium text-stone-800">Google Drive Sync</p>
                      <p className="text-xs text-stone-400">
                        {isSignedIn ? `Signed in as ${user?.email || 'user'}` : 'Sync across devices'}
                      </p>
                    </div>
                  </div>
                  {isSignedIn ? (
                    <button onClick={signOut} className="text-sm text-rose-500 font-medium">Sign Out</button>
                  ) : (
                    <button onClick={signIn} className="text-sm text-emerald-600 font-medium">Sign In</button>
                  )}
                </div>

                {isSignedIn && lastSynced && (
                  <p className="text-xs text-stone-400 text-center">
                    Last synced: {lastSynced.toLocaleTimeString()}
                  </p>
                )}

                {isSignedIn && (
                  <button
                    onClick={() => { syncWithDrive(); }}
                    className="w-full py-3 rounded-xl border border-stone-200 text-stone-600 font-medium flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                    Sync Now
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Session Edit Modal */}
        {editingSession && (
          <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-fade-in" onClick={() => setEditingSession(null)}>
            <div className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-auto animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white px-5 py-4 border-b border-stone-100 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-stone-800">{editingSession.workoutName}</h2>
                  <p className="text-xs text-stone-400">
                    {new Date(editingSession.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <button onClick={() => setEditingSession(null)} className="text-stone-400"><X size={22} /></button>
              </div>
              
              <div className="p-5 space-y-4">
                {editingSession.exercises.map((ex, exIdx) => (
                  <div key={exIdx} className="bg-stone-50 rounded-xl p-4">
                    <h3 className="font-medium text-stone-800 mb-3">{ex.exerciseName}</h3>
                    <div className="space-y-2">
                      {ex.sets.map((set, setIdx) => (
                        <div key={setIdx} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${set.type === 'warmup' ? 'bg-stone-100 text-stone-500' : 'bg-violet-100 text-violet-600'}`}>
                              {set.type === 'warmup' ? 'W' : 'S'}
                            </span>
                            {set.side && (
                              <span className="text-xs text-stone-400">{set.side === 'right' ? 'R' : 'L'}</span>
                            )}
                            <span className="text-sm text-stone-700">
                              {formatWeight(set.weight, editingSession.trainingMode === 'travel')} × {set.reps}
                            </span>
                            {set.rpe && <span className="text-xs text-stone-400">@ {set.rpe}</span>}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => togglePROnSet(exIdx, setIdx)}
                              className={`p-1.5 rounded-lg ${set.isPR ? 'bg-amber-100' : 'bg-stone-100'}`}
                            >
                              <Star size={14} className={set.isPR ? 'text-amber-500 fill-amber-500' : 'text-stone-400'} />
                            </button>
                            <button
                              onClick={() => deleteSetFromSession(exIdx, setIdx)}
                              className="p-1.5 rounded-lg bg-stone-100"
                            >
                              <Trash2 size={14} className="text-stone-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => deleteSession(editingSession.id)}
                    className="flex-1 py-3 rounded-xl border border-rose-200 text-rose-500 font-medium text-sm"
                  >
                    Delete Session
                  </button>
                  <button
                    onClick={saveEditedSession}
                    className="flex-1 py-3 rounded-xl bg-stone-800 text-white font-medium text-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-stone-200 px-8 py-4 safe-bottom">
          <div className="flex justify-around">
            <button onClick={() => setScreen('home')} className="flex flex-col items-center gap-1 text-stone-800">
              <Home size={22} />
              <span className="text-[10px] font-medium">Home</span>
            </button>
            <button onClick={() => setScreen('progress')} className="flex flex-col items-center gap-1 text-stone-400">
              <TrendingUp size={22} />
              <span className="text-[10px] font-medium">Progress</span>
            </button>
            <button onClick={() => setScreen('program')} className="flex flex-col items-center gap-1 text-stone-400">
              <Dumbbell size={22} />
              <span className="text-[10px] font-medium">Program</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== WORKOUT SCREEN ==========
  if (screen === 'workout' && currentWorkout) {
    const ex = currentWorkout.exercises[currentExerciseIndex];
    const set = ex.sets[currentSetIndex];
    const lastWorkout = history
      .filter(h => h.workoutType === currentWorkout.workoutType && h.trainingMode === currentWorkout.trainingMode)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const lastPerf = lastWorkout?.exercises.find(e => e.exerciseId === ex.id)?.sets.find(s => 
      s.type === set.type && (!set.side || s.side === set.side)
    );
    const c = colors[currentWorkout.workoutType];
    const isTravel = isCurrentWorkoutTravel;

    // Calculate display info for unilateral exercises
    const setNumber = ex.unilateral 
      ? Math.floor(currentSetIndex / 2) + 1 
      : currentSetIndex + 1;
    const totalSetsDisplay = ex.unilateral 
      ? ex.sets.length / 2 
      : ex.sets.length;

    return (
      <div className="min-h-screen bg-stone-50">
        {/* Header */}
        <div className="bg-white border-b border-stone-100 px-5 py-4 safe-top">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => { setScreen('home'); setCurrentWorkout(null); }} className="text-stone-400 -ml-1 p-1">
              <X size={22} />
            </button>
            <div className="flex items-center gap-2">
              {isTravel && <Plane size={14} className="text-sky-500" />}
              <div className="flex items-center gap-1.5">
                {currentWorkout.exercises.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i <= currentExerciseIndex ? c.bg : 'bg-stone-200'}`} />
                ))}
              </div>
            </div>
            <button onClick={finishWorkout} className={`${c.text} font-semibold text-sm`}>Done</button>
          </div>
          <h2 className="text-xl font-bold text-stone-800">{ex.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${set.type === 'warmup' ? 'bg-stone-100 text-stone-500' : `${c.light} ${c.text}`}`}>
              {set.type === 'warmup' ? `Warm-up ${setNumber}` : `Working ${setNumber}`}
            </span>
            {set.side && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${set.side === 'right' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                {set.side === 'right' ? '→ Right' : '← Left'}
              </span>
            )}
            <span className="text-xs text-stone-400">{ex.targetReps} · {ex.tempo}</span>
          </div>
        </div>

        {/* Rest Timer */}
        {restTimeLeft > 0 && (
          <div className={`${c.bg} text-white px-5 py-3 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <Timer size={18} />
              <span className="text-sm">Rest</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold tabular-nums">{restTimeLeft}s</span>
              <button onClick={() => setRestTimeLeft(0)} className="bg-white/20 px-3 py-1 rounded-lg text-xs font-medium">Skip</button>
            </div>
          </div>
        )}

        {/* Last Performance */}
        {lastPerf && (
          <div className="bg-amber-50 px-5 py-2.5 border-b border-amber-100">
            <p className="text-xs text-amber-700 text-center">
              Last{set.side ? ` (${set.side})` : ''}: {formatWeight(lastPerf.weight, isTravel)} × {lastPerf.reps} @ RPE {lastPerf.rpe}
            </p>
          </div>
        )}

        {/* Weight / Band Level */}
        <div className="px-5 py-5 bg-white border-b border-stone-100">
          <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-3 block">
            {isTravel ? 'Band Level' : 'Weight (kg)'}
          </label>
          
          {isTravel ? (
            // Band level selector
            <div className="flex justify-center gap-2">
              {BAND_LEVELS.map((level, i) => (
                <button
                  key={i}
                  onClick={() => setLogWeight(i)}
                  className={`px-3 py-3 rounded-xl font-medium text-sm transition-all ${
                    logWeight === i ? `${c.bg} text-white` : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          ) : (
            // Weight selector
            <div className="flex items-center justify-center gap-2">
              {[-5, -1].map(n => (
                <button key={n} onClick={() => setLogWeight(Math.max(0, logWeight + n))} className="w-12 h-12 rounded-xl bg-stone-100 text-stone-600 font-semibold text-sm active:bg-stone-200">{n}</button>
              ))}
              <div className={`w-20 h-12 rounded-xl ${c.light} flex items-center justify-center`}>
                <span className={`text-2xl font-bold ${c.text} tabular-nums`}>{logWeight}</span>
              </div>
              {[1, 5].map(n => (
                <button key={n} onClick={() => setLogWeight(logWeight + n)} className="w-12 h-12 rounded-xl bg-stone-100 text-stone-600 font-semibold text-sm active:bg-stone-200">+{n}</button>
              ))}
            </div>
          )}
        </div>

        {/* Reps */}
        <div className="px-5 py-5 bg-white border-b border-stone-100">
          <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-3 block">Reps</label>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setLogReps(Math.max(1, logReps - 1))} className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center active:bg-stone-200">
              <Minus size={20} className="text-stone-600" />
            </button>
            <div className={`w-20 h-12 rounded-xl ${c.light} flex items-center justify-center`}>
              <span className={`text-2xl font-bold ${c.text} tabular-nums`}>{logReps}</span>
            </div>
            <button onClick={() => setLogReps(logReps + 1)} className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center active:bg-stone-200">
              <Plus size={20} className="text-stone-600" />
            </button>
          </div>
        </div>

        {/* RPE */}
        <div className="px-5 py-5 bg-white border-b border-stone-100">
          <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-3 block">Effort (RPE)</label>
          <div className="flex justify-center gap-2">
            {[6, 7, 8, 9, 10].map(v => (
              <button
                key={v}
                onClick={() => setLogRpe(v)}
                className={`w-11 h-11 rounded-xl font-semibold text-sm transition-all ${logRpe === v ? `${c.bg} text-white` : 'bg-stone-100 text-stone-500'}`}
              >{v}</button>
            ))}
          </div>
          <p className="text-center text-[10px] text-stone-400 mt-2">
            {logRpe <= 7 ? '3+ reps left' : logRpe === 8 ? '2 reps left' : logRpe === 9 ? '1 rep left' : 'Max effort'}
          </p>
        </div>

        {/* Tip */}
        <div className="px-5 py-4">
          <div className="bg-stone-100 rounded-xl px-4 py-3">
            <p className="text-xs text-stone-600">💡 {ex.notes}</p>
          </div>
        </div>

        {/* Log Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-stone-200 safe-bottom">
          <button onClick={logSet} className={`w-full py-4 rounded-2xl ${c.bg} text-white font-semibold flex items-center justify-center gap-2`}>
            <Check size={20} />
            Log {set.side ? `${set.side.charAt(0).toUpperCase() + set.side.slice(1)} Side` : 'Set'}
          </button>
        </div>

        {/* Exercise List */}
        <div className="px-5 pt-2 pb-28">
          <h3 className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Exercises</h3>
          <div className="space-y-1.5">
            {currentWorkout.exercises.map((e, i) => {
              const done = e.sets.filter(s => s.completed).length;
              const total = e.sets.length;
              const displayTotal = e.unilateral ? total / 2 : total;
              const displayDone = e.unilateral ? Math.floor(done / 2) + (done % 2 === 1 ? 0.5 : 0) : done;
              const isActive = i === currentExerciseIndex;
              const isDone = done === total;

              return (
                <button
                  key={e.id}
                  onClick={() => { setCurrentExerciseIndex(i); setCurrentSetIndex(Math.min(done, total - 1)); }}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-all ${isActive ? `${c.light} ${c.border} border` : isDone ? 'bg-emerald-50' : 'bg-stone-50'}`}
                >
                  <div className="flex items-center gap-2.5">
                    {isDone ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"><Check size={12} className="text-white" /></div>
                    ) : (
                      <div className={`w-5 h-5 rounded-full border-2 ${isActive ? c.border.replace('border-', 'border-') : 'border-stone-300'}`} />
                    )}
                    <span className={`text-sm font-medium ${isActive ? c.text : isDone ? 'text-emerald-700' : 'text-stone-600'}`}>{e.name}</span>
                    {e.unilateral && <span className="text-[10px] text-stone-400">L/R</span>}
                  </div>
                  <span className="text-xs text-stone-400">{displayDone}/{displayTotal}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PR Celebration */}
        {showPRCelebration && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowPRCelebration(false)}>
            <div className="bg-white rounded-3xl p-8 text-center mx-6 shadow-2xl animate-bounce-subtle">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={32} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-stone-800 mb-1">Personal Record!</h2>
              <p className="text-stone-500 text-sm">You just beat your previous best 🎉</p>
              <Sparkles className="text-amber-400 mx-auto mt-4" size={20} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========== PROGRESS SCREEN ==========
  if (screen === 'progress') {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="px-5 pt-8 pb-28 safe-top">
          <h1 className="text-2xl font-bold text-stone-800 mb-6">Progress</h1>

          <button
            onClick={() => { setReportText(generateReport(history, routine, trainingMode)); setShowReport(true); }}
            className="w-full mb-8 p-4 rounded-2xl bg-stone-800 text-white font-semibold flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <FileText size={18} />
            Generate 30-Day Report
          </button>

          {/* Mode Toggle for viewing */}
          <div className="flex bg-stone-200 rounded-xl p-1 mb-4">
            <button
              onClick={() => setTrainingMode('home')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-xs transition-all ${
                trainingMode === 'home' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'
              }`}
            >
              🏠 Home
            </button>
            <button
              onClick={() => setTrainingMode('travel')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-xs transition-all ${
                trainingMode === 'travel' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'
              }`}
            >
              <Plane size={14} />
              Travel
            </button>
          </div>

          <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Exercise Trends</h2>
          <div className="space-y-3">
            {Object.values(routine).flatMap(day => day.exercises).map(ex => {
              const data = getExerciseHistory(ex.id);
              if (data.length < 2) return null;
              const max = Math.max(...data.map(d => d.weight));
              const min = Math.min(...data.map(d => d.weight));
              const range = max - min || 1;
              const isTravel = ex.id.startsWith('travel-');

              return (
                <div key={ex.id} className="bg-white rounded-xl p-4 border border-stone-100">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-stone-700">{ex.name}</h3>
                    <span className="text-sm font-semibold text-stone-800">
                      {formatWeight(data[data.length - 1].weight, isTravel)}
                    </span>
                  </div>
                  <div className="h-10 flex items-end gap-1">
                    {data.map((d, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm transition-all"
                        style={{ height: `${((d.weight - min) / range) * 70 + 30}%`, backgroundColor: i === data.length - 1 ? '#57534e' : '#d6d3d1' }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Report Modal */}
          {showReport && (
            <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-fade-in">
              <div className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-auto animate-slide-up">
                <div className="sticky top-0 bg-white px-5 py-4 border-b border-stone-100 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-stone-800">30-Day Report</h2>
                  <button onClick={() => setShowReport(false)} className="text-stone-400 p-1"><X size={22} /></button>
                </div>
                <div className="p-5">
                  <pre className="text-[11px] text-stone-700 whitespace-pre-wrap font-mono bg-stone-50 p-4 rounded-xl overflow-x-auto hide-scrollbar">{reportText}</pre>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(reportText); }}
                    className="w-full mt-4 py-3 rounded-xl bg-stone-800 text-white font-medium text-sm active:scale-[0.98]"
                  >
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-stone-200 px-8 py-4 safe-bottom">
          <div className="flex justify-around">
            <button onClick={() => setScreen('home')} className="flex flex-col items-center gap-1 text-stone-400"><Home size={22} /><span className="text-[10px] font-medium">Home</span></button>
            <button onClick={() => setScreen('progress')} className="flex flex-col items-center gap-1 text-stone-800"><TrendingUp size={22} /><span className="text-[10px] font-medium">Progress</span></button>
            <button onClick={() => setScreen('program')} className="flex flex-col items-center gap-1 text-stone-400"><Dumbbell size={22} /><span className="text-[10px] font-medium">Program</span></button>
          </div>
        </div>
      </div>
    );
  }

  // ========== PROGRAM SCREEN ==========
  if (screen === 'program') {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="px-5 pt-8 pb-28 safe-top">
          <h1 className="text-2xl font-bold text-stone-800 mb-6">Program</h1>

          {/* Mode Toggle */}
          <div className="flex bg-stone-200 rounded-xl p-1 mb-6">
            <button
              onClick={() => setTrainingMode('home')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
                trainingMode === 'home' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'
              }`}
            >
              🏠 Home
            </button>
            <button
              onClick={() => setTrainingMode('travel')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
                trainingMode === 'travel' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'
              }`}
            >
              <Plane size={16} />
              Travel
            </button>
          </div>

          {['legs', 'pull', 'push'].map(key => {
            const day = routine[key];
            const c = colors[key];

            return (
              <div key={key} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${c.bg}`} />
                  <h2 className="text-sm font-semibold text-stone-800">{day.name}</h2>
                  <span className="text-xs text-stone-400">· {day.dayOfWeek}</span>
                </div>
                <div className="space-y-2">
                  {day.exercises.map((ex, i) => (
                    <div key={ex.id} className="bg-white rounded-xl px-4 py-3 border border-stone-100 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-stone-700">{ex.name}</p>
                          {isUnilateral(ex) && <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-500">L/R</span>}
                        </div>
                        <p className="text-xs text-stone-400">{ex.targetReps} · {ex.tempo} · {ex.warmupSets}W + {ex.workingSets}S</p>
                      </div>
                      <button onClick={() => setEditingExercise({ dayKey: key, index: i, ...ex })} className="text-stone-300 p-1"><Edit2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Edit Modal */}
          {editingExercise && (
            <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-fade-in">
              <div className="bg-white rounded-t-3xl w-full p-5 max-h-[80vh] overflow-auto animate-slide-up">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-bold text-stone-800">Edit Exercise</h2>
                  <button onClick={() => setEditingExercise(null)} className="text-stone-400"><X size={22} /></button>
                </div>
                <div className="space-y-4">
                  {[['name', 'Name'], ['targetReps', 'Target Reps'], ['tempo', 'Tempo']].map(([field, label]) => (
                    <div key={field}>
                      <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1 block">{label}</label>
                      <input
                        type="text"
                        value={editingExercise[field]}
                        onChange={(e) => setEditingExercise({ ...editingExercise, [field]: e.target.value })}
                        className="w-full p-3 rounded-xl bg-stone-100 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                      />
                    </div>
                  ))}
                  
                  {/* Warmup Sets */}
                  <div>
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2 block">Warm-up Sets</label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setEditingExercise({ ...editingExercise, warmupSets: Math.max(0, editingExercise.warmupSets - 1) })}
                        className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center active:bg-stone-200"
                      >
                        <Minus size={18} className="text-stone-600" />
                      </button>
                      <div className="w-16 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-stone-800">{editingExercise.warmupSets}</span>
                      </div>
                      <button 
                        onClick={() => setEditingExercise({ ...editingExercise, warmupSets: editingExercise.warmupSets + 1 })}
                        className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center active:bg-stone-200"
                      >
                        <Plus size={18} className="text-stone-600" />
                      </button>
                    </div>
                  </div>

                  {/* Working Sets */}
                  <div>
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2 block">Working Sets</label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setEditingExercise({ ...editingExercise, workingSets: Math.max(1, editingExercise.workingSets - 1) })}
                        className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center active:bg-stone-200"
                      >
                        <Minus size={18} className="text-stone-600" />
                      </button>
                      <div className="w-16 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-stone-800">{editingExercise.workingSets}</span>
                      </div>
                      <button 
                        onClick={() => setEditingExercise({ ...editingExercise, workingSets: editingExercise.workingSets + 1 })}
                        className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center active:bg-stone-200"
                      >
                        <Plus size={18} className="text-stone-600" />
                      </button>
                    </div>
                  </div>

                  {/* Unilateral Toggle */}
                  <div>
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2 block">Exercise Type</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingExercise({ ...editingExercise, unilateral: false, targetReps: editingExercise.targetReps.replace(' each', '') })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${!editingExercise.unilateral && !editingExercise.targetReps.includes('each') ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500'}`}
                      >
                        Both Sides
                      </button>
                      <button
                        onClick={() => setEditingExercise({ ...editingExercise, unilateral: true, targetReps: editingExercise.targetReps.includes('each') ? editingExercise.targetReps : editingExercise.targetReps + ' each' })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${editingExercise.unilateral || editingExercise.targetReps.includes('each') ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500'}`}
                      >
                        L/R Separate
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1 block">Notes</label>
                    <textarea
                      value={editingExercise.notes}
                      onChange={(e) => setEditingExercise({ ...editingExercise, notes: e.target.value })}
                      className="w-full p-3 rounded-xl bg-stone-100 text-stone-800 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-stone-300"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newRoutine = JSON.parse(JSON.stringify(routine));
                    newRoutine[editingExercise.dayKey].exercises[editingExercise.index] = {
                      id: editingExercise.id, 
                      name: editingExercise.name, 
                      targetReps: editingExercise.targetReps,
                      tempo: editingExercise.tempo, 
                      warmupSets: editingExercise.warmupSets, 
                      workingSets: editingExercise.workingSets, 
                      notes: editingExercise.notes,
                      unilateral: editingExercise.unilateral || editingExercise.targetReps.includes('each')
                    };
                    setRoutine(newRoutine);
                    setEditingExercise(null);
                  }}
                  className="w-full mt-5 py-3 rounded-xl bg-stone-800 text-white font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-stone-200 px-8 py-4 safe-bottom">
          <div className="flex justify-around">
            <button onClick={() => setScreen('home')} className="flex flex-col items-center gap-1 text-stone-400"><Home size={22} /><span className="text-[10px] font-medium">Home</span></button>
            <button onClick={() => setScreen('progress')} className="flex flex-col items-center gap-1 text-stone-400"><TrendingUp size={22} /><span className="text-[10px] font-medium">Progress</span></button>
            <button onClick={() => setScreen('program')} className="flex flex-col items-center gap-1 text-stone-800"><Dumbbell size={22} /><span className="text-[10px] font-medium">Program</span></button>
          </div>
        </div>
      </div>
    );
  }

  // ========== SUMMARY SCREEN ==========
  if (screen === 'summary') {
    const last = history[history.length - 1];
    if (!last) { setScreen('home'); return null; }
    const prs = last.exercises.flatMap(e => e.sets).filter(s => s.isPR).length;
    const c = colors[last.workoutType];
    const isTravel = last.trainingMode === 'travel';

    return (
      <div className={`min-h-screen ${c.bg} p-6 flex flex-col items-center justify-center text-white safe-top safe-bottom`}>
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
          <Trophy size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-1">Workout Complete</h1>
        <div className="flex items-center gap-2 text-white/70 mb-8">
          <span>{last.workoutName} Day</span>
          {isTravel && <Plane size={14} />}
        </div>

        <div className="flex gap-4 mb-10">
          <div className="bg-white/20 rounded-2xl px-6 py-4 text-center">
            <p className="text-3xl font-bold tabular-nums">{last.exercises.length}</p>
            <p className="text-white/70 text-xs mt-1">exercises</p>
          </div>
          <div className="bg-white/20 rounded-2xl px-6 py-4 text-center">
            <p className="text-3xl font-bold tabular-nums">{prs}</p>
            <p className="text-white/70 text-xs mt-1">PRs</p>
          </div>
        </div>

        <button onClick={() => setScreen('home')} className="w-full max-w-xs py-4 rounded-2xl bg-white text-stone-800 font-semibold active:scale-[0.98]">
          Done
        </button>
      </div>
    );
  }

  return null;
}
