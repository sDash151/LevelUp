import { useMemo } from 'react';
import clsx from 'clsx';
import Model from 'react-body-highlighter';

const MUSCLE_MAPPING = {
  trapezius: ['traps', 'trapezius'],
  'upper-back': ['upper back', 'middle back', 'lats', 'back'],
  'lower-back': ['lower back'],
  chest: ['chest', 'pectorals'],
  biceps: ['biceps'],
  triceps: ['triceps'],
  forearm: ['forearms', 'forearm'],
  'back-deltoids': ['rear delts', 'back deltoids', 'shoulders'],
  'front-deltoids': ['front delts', 'deltoids', 'shoulders'],
  abs: ['abdominals', 'core', 'abs'],
  obliques: ['obliques'],
  adductor: ['adductors'],
  abductors: ['abductors'],
  hamstring: ['hamstrings', 'hamstring'],
  quadriceps: ['quadriceps', 'quads', 'legs'],
  calves: ['calves', 'calfs'],
  gluteal: ['glutes', 'gluteal'],
  neck: ['neck']
};

export function MuscleHeatmap({ activeMuscles = [], className }) {
  const activeMappedMuscles = useMemo(() => {
    const keys = new Set();
    activeMuscles.forEach(m => {
      Object.entries(MUSCLE_MAPPING).forEach(([key, list]) => {
        if (list.includes(m.toLowerCase()) || key === m.toLowerCase()) keys.add(key);
      });
    });
    return Array.from(keys);
  }, [activeMuscles]);

  const data = [
    { name: 'Active Exercise', muscles: activeMappedMuscles }
  ];

  return (
    <div className={clsx("relative flex flex-col items-center justify-center gap-4 py-2", className)}>
      <div className="flex gap-4">
        <Model
          data={data}
          style={{ width: '8rem' }}
          type="anterior"
          bodyColor="#333344"
          highlightedColors={['#818cf8', '#6366f1']}
        />
        <Model
          data={data}
          style={{ width: '8rem' }}
          type="posterior"
          bodyColor="#333344"
          highlightedColors={['#818cf8', '#6366f1']}
        />
      </div>
      <div className="flex items-center gap-4 text-[10px] uppercase font-black tracking-widest text-[var(--th-text-secondary)] mt-2">
         <span>Front</span>
         <span>Back</span>
      </div>
    </div>
  );
}
