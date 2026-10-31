import { useId } from 'react';

/** Equal regular hexagons on one lattice; vector artwork stays crisp at any size. */
export function BrandLogo({
  className = '',
  label = 'Cloud Seam Tech',
  wording = 'black',
}: {
  className?: string;
  label?: string;
  wording?: 'black' | 'white';
}) {
  const id = useId().replace(/:/g, '');
  const hex = '23,0 11.5,19.919 -11.5,19.919 -23,0 -11.5,-19.919 11.5,-19.919';
  return (
    <span
      className={'spaced-brand-logo quiet-brand ' + className}
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 126 88" className="quiet-brand-mark" aria-hidden="true">
        <defs>
          <linearGradient id={id + '-gold'} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#f6ca46" />
            <stop offset="1" stopColor="#aeb4bb" />
          </linearGradient>
          <linearGradient id={id + '-slate'} x2="1" y2="1">
            <stop stopColor="#46505b" />
            <stop offset="1" stopColor="#28313c" />
          </linearGradient>
        </defs>
        <polygon
          points={hex}
          transform="translate(62 23)"
          fill={'url(#' + id + '-gold)'}
        />
        <polygon
          points={hex}
          transform="translate(25.75 43.93)"
          fill={'url(#' + id + '-gold)'}
        />
        <polygon
          points={hex}
          transform="translate(62 64.86)"
          fill={'url(#' + id + '-slate)'}
        />
        <polygon
          points={hex}
          transform="translate(98.25 43.93)"
          fill={'url(#' + id + '-slate)'}
        />
      </svg>
      <span
        className="quiet-brand-word"
        style={{ color: wording === 'white' ? '#fff' : '#26313d' }}
      >
        Cloud Seam Tech
      </span>
    </span>
  );
}
