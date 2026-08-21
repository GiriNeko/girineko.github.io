import { lazy, Suspense } from 'react';

const CanvasScene = lazy(() => import('./AtmosphereCanvas'));

export default function Atmosphere() {
  return (
    <div className="atmosphere">
      <Suspense fallback={null}>
        <CanvasScene />
      </Suspense>
    </div>
  );
}
