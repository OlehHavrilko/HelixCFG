import { create } from 'zustand';
import { Build, Component, Price, BuildReport } from '../domain/model/types';
import { generateBuildReport } from '../domain/services/buildReport';

interface Preset {
  id: string;
  name: string;
  description: string;
  build: Build;
}

interface AppState {
  // Data
  components: Component[];
  prices: Price[];
  presets: Preset[];

  // Current build
  currentBuild: Build;

  // Computed report
  report: BuildReport | null;

  // Actions
  setComponents: (components: Component[]) => void;
  setPrices: (prices: Price[]) => void;
  setPresets: (presets: Preset[]) => void;
  selectComponent: (type: keyof Build, id: string | string[]) => void;
  removeComponent: (type: keyof Build, id?: string) => void;
  loadPreset: (presetId: string) => void;
  setTarget: (target: Build['meta']['target']) => void;
  setBudget: (budget?: number) => void;

  // Selectors
  getSelectedComponents: () => Component[];
  getAvailableComponents: (type: string) => Component[];
  getPriceForComponent: (id: string) => Price | undefined;
}

const initialBuild: Build = {
  ram: [],
  storage: [],
  meta: {
    target: 'gaming',
  },
};

export const useAppStore = create<AppState>((set, get) => ({
  components: [],
  prices: [],
  presets: [],
  currentBuild: initialBuild,
  report: null,

  setComponents: (components) => set({ components }),

  setPrices: (prices) => set({ prices }),

  setPresets: (presets) => set({ presets }),

  selectComponent: (type, id) => {
    set((state) => {
      const newBuild = { ...state.currentBuild };
      if (Array.isArray(id)) {
        (newBuild as any)[type] = id;
      } else {
        (newBuild as any)[type] = id;
      }
      const report = generateBuildReport(newBuild, state.components, state.prices);
      return { currentBuild: newBuild, report };
    });
  },

  removeComponent: (type, id) => {
    set((state) => {
      const newBuild = { ...state.currentBuild };
      if (type === 'ram' || type === 'storage') {
        const arr = (newBuild as any)[type] as string[];
        if (id) {
          (newBuild as any)[type] = arr.filter(i => i !== id);
        } else {
          (newBuild as any)[type] = [];
        }
      } else {
        (newBuild as any)[type] = undefined;
      }
      const report = generateBuildReport(newBuild, state.components, state.prices);
      return { currentBuild: newBuild, report };
    });
  },

  loadPreset: (presetId) => {
    set((state) => {
      const preset = state.presets.find(p => p.id === presetId);
      if (preset) {
        const report = generateBuildReport(preset.build, state.components, state.prices);
        return { currentBuild: preset.build, report };
      }
      return {};
    });
  },

  setTarget: (target) => {
    set((state) => {
      const newBuild = {
        ...state.currentBuild,
        meta: { ...state.currentBuild.meta, target },
      };
      const report = generateBuildReport(newBuild, state.components, state.prices);
      return { currentBuild: newBuild, report };
    });
  },

  setBudget: (budget) => {
    set((state) => {
      const newBuild = {
        ...state.currentBuild,
        meta: { ...state.currentBuild.meta, budget },
      };
      const report = generateBuildReport(newBuild, state.components, state.prices);
      return { currentBuild: newBuild, report };
    });
  },

  getSelectedComponents: () => {
    const state = get();
    const ids = [
      state.currentBuild.cpu,
      state.currentBuild.gpu,
      state.currentBuild.motherboard,
      state.currentBuild.cooler,
      state.currentBuild.case,
      state.currentBuild.psu,
      ...state.currentBuild.ram,
      ...state.currentBuild.storage,
    ].filter(Boolean) as string[];
    return ids.map(id => state.components.find(c => c.id === id)!).filter(Boolean);
  },

  getAvailableComponents: (type) => {
    const state = get();
    return state.components.filter(c => c.type === type);
  },

  getPriceForComponent: (id) => {
    const state = get();
    return state.prices.find(p => p.componentId === id);
  },
}));
