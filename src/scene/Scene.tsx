import { ContactShadows } from '@react-three/drei';
import { EnvStage } from './EnvStage';
import { Lighting } from './Lighting';
import { CameraRig } from './CameraRig';
import { Car } from './car/Car';
import { PartAnimator, PaintApplier } from './car/PartAnimator';
import { Headlights } from './car/Headlights';
import { Wheels } from './car/Wheels';
import { Post } from './fx/Post';

export function Scene() {
  return (
    <>
      <EnvStage />
      <Lighting />
      <Car />
      <PartAnimator />
      <PaintApplier />
      <Headlights />
      <Wheels />
      <ContactShadows opacity={0.7} blur={2.5} far={4} resolution={1024} scale={20} />
      <CameraRig />
      <Post />
    </>
  );
}
