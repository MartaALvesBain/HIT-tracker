export const DEFAULT_ROUTINE = {
  legs: {
    name: "Legs",
    dayOfWeek: "Wednesday",
    color: "emerald",
    exercises: [
      { id: "goblet-squat", name: "Goblet Squat", targetReps: "12-15", tempo: "3/2/2", warmupSets: 2, workingSets: 1, notes: "Hold dumbbell at chest. Pause 2 sec at bottom." },
      { id: "romanian-deadlift", name: "Romanian Deadlift", targetReps: "10-12", tempo: "3/1/2", warmupSets: 1, workingSets: 1, notes: "Hinge at hips, keep back flat. Weight is per hand." },
      { id: "reverse-lunge", name: "Reverse Lunge", targetReps: "10-12 each", tempo: "3/1/2", warmupSets: 1, workingSets: 1, notes: "Step BACK, not forward. Safer for knees." },
      { id: "hip-thrust", name: "Hip Thrust", targetReps: "12-15", tempo: "2/2/2", warmupSets: 1, workingSets: 1, notes: "Upper back on couch/bench. Squeeze glutes hard at top." },
      { id: "band-leg-curl", name: "Band Leg Curl", targetReps: "15-20", tempo: "2/1/3", warmupSets: 1, workingSets: 1, notes: "3-second lowering is critical. Keep hips down." },
      { id: "calf-raise", name: "Standing Calf Raise", targetReps: "15-20", tempo: "2/2/2", warmupSets: 1, workingSets: 1, notes: "Full stretch at bottom, squeeze at top." }
    ]
  },
  push: {
    name: "Push",
    dayOfWeek: "Saturday",
    color: "rose",
    exercises: [
      { id: "floor-press", name: "Dumbbell Floor Press", targetReps: "12-15", tempo: "3/1/2", warmupSets: 2, workingSets: 1, notes: "Lower until triceps touch floor. Weight is per hand." },
      { id: "incline-pushup", name: "Incline Push-Up", targetReps: "12-20", tempo: "3/2/2", warmupSets: 1, workingSets: 1, notes: "Hands on chair/bench. Progress to lower surfaces." },
      { id: "shoulder-press", name: "DB Shoulder Press", targetReps: "10-12", tempo: "3/1/2", warmupSets: 1, workingSets: 1, notes: "Sit tall, don't arch back. Weight is per hand." },
      { id: "lateral-raise", name: "Lateral Raise", targetReps: "12-15", tempo: "2/1/2", warmupSets: 1, workingSets: 1, notes: "Go LIGHT. Lead with elbows. Weight is per hand." },
      { id: "tricep-extension", name: "Tricep Extension", targetReps: "12-15", tempo: "3/1/2", warmupSets: 1, workingSets: 1, notes: "One dumbbell, both hands. Elbows point forward." }
    ]
  },
  pull: {
    name: "Pull",
    dayOfWeek: "Sunday",
    color: "violet",
    exercises: [
      { id: "db-row", name: "Single-Arm DB Row", targetReps: "10-12 each", tempo: "3/1/2", warmupSets: 1, workingSets: 1, notes: "Pull elbow toward hip, squeeze shoulder blade." },
      { id: "band-pulldown", name: "Band Lat Pulldown", targetReps: "12-15", tempo: "3/2/2", warmupSets: 1, workingSets: 1, notes: "Anchor high. Pull to upper chest, squeeze lats." },
      { id: "db-pullover", name: "Dumbbell Pullover", targetReps: "12-15", tempo: "3/1/2", warmupSets: 1, workingSets: 1, notes: "Feel the lat stretch. Slight elbow bend." },
      { id: "face-pull", name: "Band Face Pull", targetReps: "15-20", tempo: "2/1/2", warmupSets: 1, workingSets: 1, notes: "Pull toward face, separate hands. Great for posture." },
      { id: "bicep-curl", name: "Dumbbell Bicep Curl", targetReps: "10-12", tempo: "3/1/2", warmupSets: 1, workingSets: 1, notes: "No swinging. Slow lowering. Weight is per hand." }
    ]
  }
};

export const STARTING_WEIGHTS = {
  'goblet-squat': 16,
  'romanian-deadlift': 12,
  'reverse-lunge': 8,
  'hip-thrust': 20,
  'band-leg-curl': 0,
  'calf-raise': 12,
  'floor-press': 10,
  'incline-pushup': 0,
  'shoulder-press': 8,
  'lateral-raise': 4,
  'tricep-extension': 10,
  'db-row': 12,
  'band-pulldown': 0,
  'db-pullover': 10,
  'face-pull': 0,
  'bicep-curl': 6
};

export default DEFAULT_ROUTINE;
