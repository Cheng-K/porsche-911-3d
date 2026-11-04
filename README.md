# Porsche 911 — Interactive 3D Viewer

An unofficial, non-commercial 3D configurator for the 1975 Porsche 911 (930) Turbo, built with React Three Fiber. Open the doors, pop the hood, change the paint, steer the wheels, and switch lighting environments in real time.

> Not affiliated with or endorsed by Dr. Ing. h.c. F. Porsche AG. Vehicle design copyrights belong to Porsche AG. See [ATTRIBUTION.md](./ATTRIBUTION.md) for model and HDRI licensing.

## Features

- **Paint picker** — six factory-style colors (GT Silver, Guards Red, Racing Yellow, Gentian Blue, Jet Black, Chalk) with per-color metalness and roughness.
- **Opening parts** — both doors, the front hood, and the rear engine cover, each with physically-hinged animation.
- **Headlights** — toggle the emissive lighting on and off.
- **Wheels** — steer the front axle and spin all four wheels.
- **Environments** — switch between a procedural studio rig and two HDRIs (warm, night).
- **Quality tiers** — high / medium / low to scale post-processing and detail to the device.

## Tech stack

| Layer | Choice |
| --- | --- |
| Build | [Vite](https://vitejs.dev) 5 + TypeScript |
| UI | React 18 |
| 3D | [three.js](https://threejs.org) via [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei) |
| Post-processing | [@react-three/postprocessing](https://github.com/pmndrs/postprocessing) |
| State | [Zustand](https://github.com/pmndrs/zustand) |

## Getting started

```bash
npm install
npm run dev        # starts on http://localhost:5173
```

### Other scripts

| Command | Description |
| --- | --- |
| `npm run build` | Type-check then build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run optimize-model` | Re-optimize the GLB (Draco + KTX2) from `public/models/911.source.glb` |

## Project structure

```
src/
├── app/App.tsx              # App shell and layout
├── main.tsx                 # Entry point
├── config/parts.config.ts   # Part regions, hinges, paint colors, wheel config
├── state/store.ts           # Zustand store (paint, parts, env, quality)
├── lib/                     # Geometry helpers, part registry
├── scene/
│   ├── Scene.tsx            # Canvas + scene composition
│   ├── CameraRig.tsx        # Orbit controls and framing
│   ├── EnvStage.tsx         # Studio Lightformer rig / HDRI environments
│   ├── Lighting.tsx         # Lights
│   ├── car/
│   │   ├── Car.tsx          # Model loading
│   │   ├── PartAnimator.tsx # Hinge animation for doors/hood/engine cover
│   │   ├── Headlights.tsx   # Emissive light toggle
│   │   └── Wheels.tsx       # Steering + spin
│   └── fx/Post.tsx          # Post-processing stack
└── ui/
    ├── Overlay.tsx          # Main control panel
    ├── PaintPicker.tsx
    ├── PartControls.tsx
    ├── LightsToggle.tsx
    ├── WheelControls.tsx
    ├── EnvSwitch.tsx
    └── QualitySwitch.tsx
```

## How part detection works

The GLB mesh names are not standardized, so `src/config/parts.config.ts` classifies geometry two ways:

1. **By name** — ordered regex aliases per semantic part (`doorLeft`, `hood`, …) and per material role (`paint`, `glass`, `chrome`, …).
2. **By bounding box** — car-local regions that catch meshes the name aliases miss.

Both lists live in that one file; if you swap in a different 911 GLB, that's the only file to re-tune.

## Assets

- **Car model** — "FREE 1975 Porsche 911 (930) Turbo" by Lionsharp Studios, CC BY 4.0.
- **HDRIs** — "Brown Photostudio 02" and "Kloppenheim 06" from Poly Haven, CC0.
- **Studio lighting** — procedural Lightformer rig in `src/scene/EnvStage.tsx`, no external asset.
