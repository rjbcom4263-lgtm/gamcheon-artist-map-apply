import type { PixelRect } from '../grid/geometry';
import { boundsToContainerRect, type Bounds, type Projection } from './projectedRect';

type CaptureMap<TCoords, TCenter> = {
  setCenter(center: TCenter): void;
  setLevel(level: number, options?: { animate?: boolean }): void;
  getProjection(): Projection<TCoords>;
};

export async function prepareTileCapture<TCoords, TCenter>(
  map: CaptureMap<TCoords, TCenter>,
  bounds: Bounds<TCoords>,
  center: TCenter,
  level: number,
  waitForTiles: (updateMap: () => void) => Promise<void>,
): Promise<PixelRect> {
  await waitForTiles(() => {
    map.setLevel(level, { animate: false });
    map.setCenter(center);
  });
  return boundsToContainerRect(bounds, map.getProjection());
}
