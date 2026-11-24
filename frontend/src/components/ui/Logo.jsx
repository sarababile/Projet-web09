/** Logo AgriGestion : feuille vert tilleul dans un rond vert mousse. */
export default function Logo({ size = 40 }) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="AgriGestion">
        <circle cx="24" cy="24" r="24" fill="var(--moss)" />
        <path d="M14 34c0-12 8-20 21-20 0 13-8 20-19 20" fill="var(--linden)" />
        <path d="M13 36c5-7 11-12 18-15" stroke="var(--moss)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
    );
  }