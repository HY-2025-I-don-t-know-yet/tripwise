import { create } from 'zustand';

interface SafetyState {
    dangerLevel: number;
    setDangerLevel: (level: number) => void;
}

export const useSafetyStore = create<SafetyState>((set) => ({
    dangerLevel: 0,
    setDangerLevel: (level) => set({ dangerLevel: level }),
}));
