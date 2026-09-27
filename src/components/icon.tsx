export function Icon({ name, className = "", style }: { name: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={`ic ${className}`} style={style} aria-hidden>
      <use href={`#i-${name}`} />
    </svg>
  );
}
