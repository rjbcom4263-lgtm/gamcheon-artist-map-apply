import type { TileCoordinates } from '../map/captureTileset';

export function getMergedTileLayout(tiles: TileCoordinates[], tileWidth: number, tileHeight: number) {
  if (!tiles.length) throw new Error('선택한 타일이 없습니다.');
  if (tiles.some((tile) => tile.z !== tiles[0].z)) throw new Error('같은 확대 단계의 타일만 합칠 수 있습니다.');
  const minX = Math.min(...tiles.map((tile) => tile.x));
  const maxX = Math.max(...tiles.map((tile) => tile.x));
  const minY = Math.min(...tiles.map((tile) => tile.y));
  const maxY = Math.max(...tiles.map((tile) => tile.y));
  return {
    width: (maxX - minX + 1) * tileWidth,
    height: (maxY - minY + 1) * tileHeight,
    placements: tiles.map((tile) => ({ x: (tile.x - minX) * tileWidth, y: (maxY - tile.y) * tileHeight })),
    bounds: { minX, maxX, minY, maxY, z: tiles[0].z },
  };
}

export function mergedTilesFilename(tiles: TileCoordinates[]): string {
  const { bounds } = getMergedTileLayout(tiles, 1, 1);
  return `kakao-selected-area-${bounds.z}-${bounds.minX}-${bounds.minY}-${bounds.maxX}-${bounds.maxY}.png`;
}

export async function mergeCapturedTiles(blobs: Blob[], tiles: TileCoordinates[]): Promise<Blob> {
  if (blobs.length !== tiles.length) throw new Error('캡처 결과와 선택 타일 수가 다릅니다.');
  const images = await Promise.all(blobs.map((blob) => createImageBitmap(blob)));
  try {
    const tileWidth = images[0]?.width ?? 0;
    const tileHeight = images[0]?.height ?? 0;
    if (!tileWidth || !tileHeight || images.some((image) => image.width !== tileWidth || image.height !== tileHeight)) {
      throw new Error('타일 이미지 크기가 서로 다릅니다.');
    }
    const layout = getMergedTileLayout(tiles, tileWidth, tileHeight);
    const canvas = document.createElement('canvas');
    canvas.width = layout.width;
    canvas.height = layout.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('이미지를 합칠 수 없습니다.');
    images.forEach((image, index) => context.drawImage(image, layout.placements[index].x, layout.placements[index].y));
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('PNG 파일을 만들 수 없습니다.')), 'image/png'));
  } finally {
    images.forEach((image) => image.close());
  }
}
