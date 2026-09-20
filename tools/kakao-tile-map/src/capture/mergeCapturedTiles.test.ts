import { describe, expect, it } from 'vitest';
import { getMergedTileLayout, mergedTilesFilename } from './mergeCapturedTiles';

describe('merged tile layout', () => {
  const tiles = [
    { x: 10, y: 20, z: 4 },
    { x: 11, y: 20, z: 4 },
    { x: 10, y: 21, z: 4 },
  ];

  it('places larger Kakao tile y coordinates above smaller ones', () => {
    expect(getMergedTileLayout(tiles, 256, 256)).toEqual({
      width: 512,
      height: 512,
      placements: [{ x: 0, y: 256 }, { x: 256, y: 256 }, { x: 0, y: 0 }],
      bounds: { minX: 10, maxX: 11, minY: 20, maxY: 21, z: 4 },
    });
    expect(mergedTilesFilename(tiles)).toBe('kakao-selected-area-4-10-20-11-21.png');
  });
});
