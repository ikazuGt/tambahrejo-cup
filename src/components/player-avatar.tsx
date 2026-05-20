import { ImageModal } from "./image-modal";

type Props = {
  name: string;
  url?: string | null;
  size?: number;
};

export function PlayerAvatar({ name, url, size = 28 }: Props) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (url) {
    const img = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        style={{
          width: size,
          height: size,
          borderRadius: 999,
          objectFit: "cover",
          border: "1px solid var(--border)",
          flexShrink: 0,
        }}
      />
    );

    return (
      <ImageModal src={url} alt={name}>
        {img}
      </ImageModal>
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
        border: "1px solid var(--border)",
        background: "var(--muted)",
        fontSize: Math.max(9, size * 0.38),
        fontWeight: 700,
        color: "var(--muted-fg)",
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  );
}
