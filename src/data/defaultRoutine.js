export const HOME_ROUTINE = {
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

export const TRAVEL_ROUTINE = {
  legs: {
    name: "Legs",
    dayOfWeek: "Wednesday",
    color: "emerald",
    exercises: [
      { id: "travel-squat", name: "Band Squat", targetReps: "15-20", tempo: "3/2/2", warmupSets: 1, workingSets: 1, notes: "Stand on band, hold at shoulders. Heavy band." },
      { id: "travel-rdl", name: "Band RDL", targetReps: "12-15", tempo: "3/1/2", warmupSets: 1, workingSets: 1, notes: "Stand on band, hinge at hips. Keep back flat. Heavy band." },
      { id: "travel-lunge", name: "Band Reverse Lunge", targetReps: "12-15 each", tempo: "3/1/2", warmupSets: 1, workingSets: 1, notes: "Stand on band, handles at shoulders. Medium-heavy band." },
      { id: "travel-glute-bridge", name: "Band Glute Bridge", targetReps: "15-20", tempo: "2/2/2", warmupSets: 1, workingSets: 1, notes: "Band across hips, anchored under shoulders. Squeeze at top." },
      { id: "travel-leg-curl", name: "Band Leg Curl", targetReps: "15-20", tempo: "2/1/3", warmupSets: 1, workingSets: 1, notes: "Anchor low (door bottom), lie face down. 3-sec lowering." }
    ]
  },
  push: {
    name: "Push",
    dayOfWeek: "Saturday",
    color: "rose",
    exercises: [
      { id: "travel-pushup", name: "Band Push-Up", targetReps: "12-20", tempo: "3/2/2", warmupSets: 1, workingSets: 1, notes: "Band across upper back, hands on ends. Medium band." },
      { id: "travel-chest-press", name: "Band Chest Press", targetReps: "12-15", tempo: "3/1/2", warmupSets: 1, workingSets: 1, notes: "Anchor behind you (door), press forward. Heavy band." },
      { id: "travel-shoulder-press", name: "Band Shoulder Press", targetReps: "12-15", tempo: "3/1/2", warmupSets: 1, workingSets: 1, notes: "Stand on band, press overhead. Medium band." },
      { id: "travel-lateral-raise", name: "Band Lateral Raise", targetReps: "15-20", tempo: "2/1/2", warmupSets: 1, workingSets: 1, notes: "Stand on band, go light and slow. Light band." },
      { id: "travel-tricep", name: "Band Tricep Pushdown", targetReps: "12-15", tempo: "3/1/2", warmupSets: 1, workingSets: 1, notes: "Anchor high (door top), push down. Light-medium band." }
    ]
  },
  pull: {
    name: "Pull",
    dayOfWeek: "Sunday",
    color: "violet",
    exercises: [
      { id: "travel-row", name: "Band Row", targetReps: "12-15", tempo: "3/1/2", warmupSets: 1, workingSets: 1, notes: "Anchor at chest height or stand on band. Medium-heavy band." },
      { id: "travel-pulldown", name: "Band Lat Pulldown", targetReps: "12-15", tempo: "3/2/2", warmupSets: 1, workingSets: 1, notes: "Anchor high, kneel, pull to chest. Medium-heavy band." },
      { id: "travel-face-pull", name: "Band Face Pull", targetReps: "15-20", tempo: "2/1/2", warmupSets: 1, workingSets: 1, notes: "Anchor at face height. Light-medium band." },
      { id: "travel-pull-apart", name: "Band Pull-Apart", targetReps: "15-20", tempo: "2/1/2", warmupSets: 1, workingSets: 1, notes: "Hold band in front, pull hands apart. Light band." },
      { id: "travel-curl", name: "Band Bicep Curl", targetReps: "12-15", tempo: "3/1/2", warmupSets: 1, workingSets: 1, notes: "Stand on band, curl up. Medium band." }
    ]
  }
};

export const STARTING_WEIGHTS = {
  // Home weights (kg)
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
  'bicep-curl': 6,
  // Travel weights (band level: 0=bodyweight, 1=light, 2=medium, 3=heavy)
  'travel-squat': 3,
  'travel-rdl': 3,
  'travel-lunge': 2,
  'travel-glute-bridge': 3,
  'travel-leg-curl': 2,
  'travel-pushup': 2,
  'travel-chest-press': 3,
  'travel-shoulder-press': 2,
  'travel-lateral-raise': 1,
  'travel-tricep': 1,
  'travel-row': 2,
  'travel-pulldown': 2,
  'travel-face-pull': 1,
  'travel-pull-apart': 1,
  'travel-curl': 2
};

export const DEFAULT_ROUTINE = HOME_ROUTINE;

export default { HOME_ROUTINE, TRAVEL_ROUTINE, STARTING_WEIGHTS };
