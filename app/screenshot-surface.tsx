'use client';
import { useState } from 'react';
import registry from '../content/screenshots/markers.json';
export type ScreenMarker = {
  number: number;
  x: number;
  y: number;
  label: string;
  embedded?: boolean;
};
const markersBySrc = registry as Record<string, ScreenMarker[]>;
export function ScreenshotSurface({
  src,
  alt,
  onZoom,
}: {
  src: string;
  alt: string;
  onZoom?: () => void;
}) {
  const markers = markersBySrc[src] ?? [];
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="annotated-screen">
      <div className="annotated-screen-image">
        {onZoom ? (
          <button
            className="guided-image-button"
            type="button"
            onClick={onZoom}
            aria-label={`Enlarge: ${alt}`}
          >
            <img src={src} alt={alt} loading="lazy" />
          </button>
        ) : (
          <img src={src} alt={alt} />
        )}
        {markers
          .filter((marker) => !marker.embedded)
          .map((marker) => (
            <button
              key={marker.number}
              className="screen-marker"
              type="button"
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              aria-label={`Marker ${marker.number}: ${marker.label}`}
              aria-pressed={selected === marker.number}
              onClick={() => setSelected(marker.number)}
            >
              {marker.number}
            </button>
          ))}
      </div>
      {onZoom && (
        <small className="picture-zoom-label">
          Select the picture to enlarge it
        </small>
      )}
      {markers.length > 0 && (
        <ol className="screen-marker-key" aria-label="Numbered picture guide">
          {markers.map((marker) => (
            <li
              className={selected === marker.number ? 'is-selected' : ''}
              key={marker.number}
              value={marker.number}
            >
              <strong>{marker.number}.</strong> {marker.label}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
