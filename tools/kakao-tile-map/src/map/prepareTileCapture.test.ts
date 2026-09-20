import { describe, expect, it } from 'vitest';
import { prepareTileCapture } from './prepareTileCapture';

describe('prepareTileCapture', () => {
  it('centers and zooms the map, waits for fresh tiles, then projects the selected bounds', async () => {
    let center: unknown;
    let level = 4;
    let tilesReady = false;
    const phases: string[] = [];
    const targetCenter = { lat: 37.5, lng: 127 };
    const map = {
      setCenter(next: unknown) { phases.push('set-center'); center = next; },
      setLevel(next: number) { phases.push('set-level'); level = next; },
      getProjection() {
        if (!tilesReady) throw new Error('projection read before tiles were ready');
        return {
          containerPointFromCoords: (coords: 'north-west' | 'south-east') => (
            coords === 'north-west' ? { x: 100, y: 80 } : { x: 1124, y: 1104 }
          ),
        };
      },
    };

    const rect = await prepareTileCapture(
      map,
      { northWest: 'north-west', southEast: 'south-east' },
      targetCenter,
      2,
      async (updateMap) => {
        phases.push('arm-wait');
        updateMap();
        phases.push('tiles-loaded');
        tilesReady = true;
      },
    );

    expect(center).toBe(targetCenter);
    expect(level).toBe(2);
    expect(phases).toEqual(['arm-wait', 'set-level', 'set-center', 'tiles-loaded']);
    expect(rect).toEqual({ x: 100, y: 80, width: 1024, height: 1024 });
  });
});
