import { create } from 'zustand';

export type PartId = 'doorLeft' | 'doorRight' | 'hood' | 'engineCover';
export type QualityTier = 'high' | 'medium' | 'low';
export type HdriId = 'studio' | 'warm' | 'night';

export const PART_IDS: PartId[] = ['doorLeft', 'doorRight', 'hood', 'engineCover'];

interface Paint {
  color: string;
  metalness: number;
  roughness: number;
}

interface AppState {
  // carSlice
  paint: Paint;
  parts: Record<PartId, { open: boolean }>;
  lightsOn: boolean;
  steer: number;
  spin: boolean;
  capability: Record<PartId, boolean>;
  setPaint: (color: string) => void;
  togglePart: (id: PartId) => void;
  toggleLights: () => void;
  setSteer: (v: number) => void;
  toggleSpin: () => void;
  setCapability: (cap: Partial<Record<PartId, boolean>>) => void;

  // envSlice
  hdriId: HdriId;
  setHdriId: (id: HdriId) => void;

  // qualitySlice
  tier: QualityTier;
  setTier: (t: QualityTier) => void;
}

export const useStore = create<AppState>((set) => ({
  paint: { color: '#b8babd', metalness: 0.85, roughness: 0.32 },
  parts: {
    doorLeft: { open: false },
    doorRight: { open: false },
    hood: { open: false },
    engineCover: { open: false },
  },
  lightsOn: false,
  steer: 0,
  spin: false,
  capability: {
    doorLeft: false,
    doorRight: false,
    hood: false,
    engineCover: false,
  },
  setPaint: (color) => set((s) => ({ paint: { ...s.paint, color } })),
  togglePart: (id) =>
    set((s) => ({ parts: { ...s.parts, [id]: { open: !s.parts[id].open } } })),
  toggleLights: () => set((s) => ({ lightsOn: !s.lightsOn })),
  setSteer: (steer) => set({ steer }),
  toggleSpin: () => set((s) => ({ spin: !s.spin })),
  setCapability: (cap) => set((s) => ({ capability: { ...s.capability, ...cap } })),

  hdriId: 'studio',
  setHdriId: (hdriId) => set({ hdriId }),

  tier: 'high',
  setTier: (tier) => set({ tier }),
}));
