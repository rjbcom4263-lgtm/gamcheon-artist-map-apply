import type { TileCoordinates } from '../map/captureTileset';

type DownloadDependencies = {
  createObjectURL(blob: Blob): string;
  revokeObjectURL(url: string): void;
  createAnchor(): HTMLAnchorElement;
};

const browserDependencies: DownloadDependencies = {
  createObjectURL: (blob) => URL.createObjectURL(blob),
  revokeObjectURL: (url) => URL.revokeObjectURL(url),
  createAnchor: () => document.createElement('a'),
};

export function downloadBlob(
  blob: Blob,
  filename: string,
  dependencies: DownloadDependencies = browserDependencies,
): void {
  const url = dependencies.createObjectURL(blob);
  const anchor = dependencies.createAnchor();
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => dependencies.revokeObjectURL(url), 1000);
}

export function downloadCapturedTile(
  blob: Blob,
  tile: TileCoordinates,
  dependencies: DownloadDependencies = browserDependencies,
): void {
  downloadBlob(blob, `kakao-tile-${tile.z}-${tile.x}-${tile.y}.png`, dependencies);
}
