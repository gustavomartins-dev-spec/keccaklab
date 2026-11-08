import type { CSSProperties, ReactNode } from 'react';

export type IconName =
  | 'grid'
  | 'route'
  | 'flask'
  | 'arrow-right'
  | 'arrow-left'
  | 'chevron'
  | 'play'
  | 'pause'
  | 'reset'
  | 'book'
  | 'sun'
  | 'check'
  | 'sparkles'
  | 'info'
  | 'close';

const paths: Record<IconName, ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  route: (
    <>
      <circle cx="5" cy="6" r="2" />
      <circle cx="19" cy="18" r="2" />
      <path d="M7 6h9a4 4 0 0 1 0 8H8a2 2 0 0 0 0 4h9" />
    </>
  ),
  flask: (
    <>
      <path d="M9 3h6M10 3v7L4.8 19a1.3 1.3 0 0 0 1.1 2h12.2a1.3 1.3 0 0 0 1.1-2L14 10V3M8 14h8" />
      <path d="m10 17 .01.01M14 18l.01.01" />
    </>
  ),
  'arrow-right': <path d="M4 12h16m-6-6 6 6-6 6" />,
  'arrow-left': <path d="M20 12H4m6-6-6 6 6 6" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  play: <path d="m9 5 11 7-11 7Z" />,
  pause: (
    <>
      <path d="M8 5v14M16 5v14" />
    </>
  ),
  reset: (
    <>
      <path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" />
    </>
  ),
  book: (
    <>
      <path d="M12 5v16M3 4h5a4 4 0 0 1 4 3 4 4 0 0 1 4-3h5v15h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3Z" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  sparkles: (
    <>
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4M18 4h4" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7v.01" />
    </>
  ),
  close: <path d="m6 6 12 12M6 18 18 6" />,
};

export default function Icon({
  name,
  size = 20,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {paths[name]}
    </svg>
  );
}
