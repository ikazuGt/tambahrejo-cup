type Props = {
  name: string;
  url: string | null | undefined;
  size?: number;
};

export function TeamCrest({ name, url, size = 24 }: Props) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        border: "2px solid var(--border)",
        background: "var(--muted)",
        fontSize: Math.max(9, size * 0.36),
        fontWeight: 900,
        letterSpacing: "0.02em",
        color: "var(--muted-fg)",
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  );
}
