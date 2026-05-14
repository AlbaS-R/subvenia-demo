export interface StageConfig {
  id: number;
  color: string;
}

export const STAGES_CONFIG: StageConfig[] = [
  { id: 1, color: 'blue' },
  { id: 2, color: 'purple' },
  { id: 3, color: 'emerald' },
  { id: 4, color: 'amber' },
  { id: 5, color: 'teal' },
  { id: 6, color: 'indigo' },
];

export const STAGES_COUNT = STAGES_CONFIG.length;
