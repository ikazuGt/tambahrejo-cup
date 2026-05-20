import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="stack" style={{ gap: 22 }}>
      <header className="page-header">
        <Skeleton width={200} height={32} />
      </header>
      <div className="surface" style={{ padding: 32, height: 360, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Skeleton width={280} height={200} radius={8} />
      </div>
    </div>
  );
}
