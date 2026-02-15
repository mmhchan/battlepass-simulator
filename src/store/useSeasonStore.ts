import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Transient UI state (not persisted)
interface UIState {
  hoveredPersonaId: string | null;
  setHoveredPersonaId: (id: string | null) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  hoveredPersonaId: null,
  setHoveredPersonaId: (id) => set({ hoveredPersonaId: id }),
}));
import type { SeasonConfig, Persona } from '@/engine/types';
import {
  MAX_PERSONAS,
  COLOR_PALETTE,
  DEFAULT_CONFIG,
  DEFAULT_PERSONAS,
  PERSONA_TEMPLATES,
  SEASON_PRESETS
} from '@/config/constants';

interface SeasonState {
  config: SeasonConfig;
  personas: Persona[];
  updateConfig: (updates: Partial<SeasonConfig>) => void;
  addPersona: () => void;
  removePersona: (id: string) => void;
  updatePersona: (id: string, updates: Partial<Persona>) => void;
  loadPreset: (presetKey: string) => void;
  importSnapshot: (config: SeasonConfig, personas: Omit<Persona, 'id'>[]) => void;
  resetToDefaults: () => void;
}

export const useSeasonStore = create<SeasonState>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      personas: DEFAULT_PERSONAS,
      
      updateConfig: (updates) =>
        set((state) => ({
          config: { ...state.config, ...updates },
        })),

      addPersona: () => set((state) => {
        if (state.personas.length >= MAX_PERSONAS) return state;
        const currentNames = state.personas.map(p => p.name);
        const availableTemplates = PERSONA_TEMPLATES.filter(
          t => !currentNames.includes(t.name)
        );
        const pool = availableTemplates.length > 0 ? availableTemplates : PERSONA_TEMPLATES;
        const randomTemplate = pool[Math.floor(Math.random() * pool.length)];
        const newPersona: Persona = {
          ...randomTemplate,
          id: crypto.randomUUID(),
        };
        return { personas: [...state.personas, newPersona] };
      }),

      removePersona: (id) => set((state) => ({
        personas: state.personas.filter(p => p.id !== id)
      })),

      updatePersona: (id, updates) => set((state) => ({
        personas: state.personas.map(p => p.id === id ? { ...p, ...updates } : p)
      })),

      loadPreset: (presetKey) => set((state) => {
        const preset = SEASON_PRESETS[presetKey];
        if (!preset) return state;
        return { config: { ...preset.config } };
      }),

      importSnapshot: (config, personas) => set({
        config: { ...config },
        personas: personas.map(p => ({ ...p, id: crypto.randomUUID() })),
      }),

      resetToDefaults: () => set({
        config: DEFAULT_CONFIG,
        personas: DEFAULT_PERSONAS
      }),
    }),
    {
      name: 'battlepass-sim-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);