export function Skeleton({
  width,
  height = 16,
  radius = 4,
  style,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className="skeleton"
      style={{
        display: "inline-block",
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
      aria-hidden
    />
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="match-card" style={{ pointerEvents: "none" }}>
      <div className="mc-teams">
        <div className="mc-team">
          <Skeleton width={56} height={56} radius={999} />
          <Skeleton width={70} height={12} />
        </div>
        <Skeleton width={28} height={14} />
        <div className="mc-team">
          <Skeleton width={56} height={56} radius={999} />
          <Skeleton width={70} height={12} />
        </div>
      </div>
      <Skeleton width={100} height={11} />
      <Skeleton width="100%" height={28} radius={6} />
    </div>
  );
}

export function MatchCardsGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="match-cards">
      {Array.from({ length: count }).map((_, i) => (
        <MatchCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}><Skeleton width="80%" height={14} /></td>
      ))}
    </tr>
  );
}
