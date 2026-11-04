import type { PartId } from '../state/store';

export type MaterialKind = 'paint' | 'glass' | 'chrome' | 'rubber' | 'emissive' | 'trim' | 'unknown';

/** Ordered regex aliases per semantic part. First match wins. */
export const PART_ALIASES: Record<PartId, RegExp[]> = {
  doorLeft: [/door.*(?:l|left)$/, /^(?:l|left).*door$/, /portiere.*l$/, /doorl$/, /doorleft$/],
  doorRight: [/door.*(?:r|right)$/, /^(?:r|right).*door$/, /portiere.*r$/, /doorr$/, /doorright$/],
  hood: [/hood/, /^frunk/, /bonnet/, /frontlid/],
  engineCover: [/engine.*(?:cover|lid|deck)/, /enginecover/, /motordeck/, /rearlid/, /heckdeckel/],
};

/** Ordered regex aliases per material role. */
export const MATERIAL_ALIASES: Record<MaterialKind, RegExp[]> = {
  paint: [/paint/, /body/, /carrosserie/, /lack/, /lacquer/],
  glass: [/glass/, /window/, /windshield/, /windscreen/, /vitre/, /glas/],
  chrome: [/chrome/, /polish/, /metal.*trim/, /trim.*metal/, /alu/, /rim$/],
  rubber: [/rubber/, /tire/, /tyre/, /gummi/, /pneu/, /seal/],
  emissive: [/lamp/, /light/, /emissi/, /headlight/, /tail.*light/, /bulb/, /leuchte/],
  trim: [/trim/, /plastic/, /interior/, /seat/, /dashboard/, /bumper/, /grille/, /sticker/, /plate/],
  unknown: [],
};

/**
 * All coordinates below are in CAR-LOCAL space (three.js units after the GLB
 * root transform; measured car bbox ≈ x ±1.09, y 0.09–1.97, z -2.24–2.65).
 * Front of the car is +Z, up is +Y, the car's right side is +X.
 *
 * Derived from the M1 asset spike on the Lionsharp "FREE 1975 Porsche 911
 * (930) Turbo" GLB. This file is the only one to edit when the asset changes.
 */
export interface Region {
  min: [number, number, number];
  max: [number, number, number];
}

export const PART_REGIONS: Record<PartId, Region> = {
  doorLeft: { min: [-1.02, 0.37, -0.38], max: [-0.71, 1.15, 1.1] },
  doorRight: { min: [0.71, 0.37, -0.38], max: [1.02, 1.15, 1.1] },
  // Narrow in x: only the central hood panel (fenders sit at |x|≈0.74).
  hood: { min: [-0.35, 0.6, 1.03], max: [0.35, 1.09, 2.52] },
  engineCover: { min: [-0.61, 0.93, -2.11], max: [0.61, 1.26, -1.34] },
};

export interface HingeConfig {
  /** Axis the part rotates around, in the car's local frame. */
  axis: 'x' | 'y' | 'z';
  /** Open angle in radians (sign gives direction). */
  openAngle: number;
  /** Hinge pivot in car-local coordinates. */
  pivot: [number, number, number];
}

export const HINGES: Record<PartId, HingeConfig> = {
  doorLeft: { axis: 'y', openAngle: 1.2, pivot: [-0.82, 0.77, 1.01] },
  doorRight: { axis: 'y', openAngle: -1.2, pivot: [0.82, 0.77, 1.01] },
  hood: { axis: 'x', openAngle: -0.6, pivot: [0, 0.91, 1.07] },
  engineCover: { axis: 'x', openAngle: 0.85, pivot: [0, 1.07, -1.41] },
};

export const PAINT_COLORS: { name: string; color: string; metalness: number; roughness: number }[] = [
  { name: 'GT Silver', color: '#b8babd', metalness: 0.85, roughness: 0.32 },
  { name: 'Guards Red', color: '#c2142a', metalness: 0.6, roughness: 0.3 },
  { name: 'Racing Yellow', color: '#f2c500', metalness: 0.55, roughness: 0.3 },
  { name: 'Gentian Blue', color: '#1b3a6b', metalness: 0.75, roughness: 0.3 },
  { name: 'Jet Black', color: '#0b0b0d', metalness: 0.7, roughness: 0.25 },
  { name: 'Chalk', color: '#cfc9bb', metalness: 0.5, roughness: 0.38 },
];

export type WheelId = 'frontLeft' | 'frontRight' | 'rearLeft' | 'rearRight';

/**
 * Wheel regions — only meshes whose material name matches WHEEL_MATERIAL_RE
 * are classified here, so fenders/liners never get swept up. Front axle is at
 * z≈+1.60, rear at z≈−0.98 (rear track is wider — Turbo flares).
 */
export const WHEEL_MATERIAL_RE = /rim|tire|tyre|wheel/;

export const WHEEL_REGIONS: Record<WheelId, Region> = {
  frontLeft: { min: [-1.18, 0.15, 1.15], max: [-0.48, 0.68, 2.05] },
  frontRight: { min: [0.48, 0.15, 1.15], max: [1.18, 0.68, 2.05] },
  rearLeft: { min: [-1.29, 0.15, -1.43], max: [-0.59, 0.68, -0.53] },
  rearRight: { min: [0.59, 0.15, -1.43], max: [1.29, 0.68, -0.53] },
};

/** Max steering lock for the front wheels, in radians. */
export const STEER_MAX = 0.45;

/** Wheel spin speed in radians/second when rolling. */
export const SPIN_SPEED = 2.6;

/** Components whose max bbox extent exceeds this (car-local units) are junk. */
export const JUNK_EXTENT_LIMIT = 8;
