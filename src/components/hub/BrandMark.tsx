import logo from "@/assets/logo-panela.png.asset.json";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  size?: number;
  alt?: string;
  /** Envolve a logo em uma plaqueta escura (madeira) — necessário quando o fundo é claro,
   *  já que a marca oficial contém elementos brancos. */
  plate?: boolean;
}

/**
 * Logomarca oficial do restaurante. A marca contém elementos claros, portanto
 * sempre deve aparecer sobre superfície escura. Use `plate` para envolvê-la em
 * uma plaqueta de madeira quando o fundo do container for claro.
 */
export function BrandMark({ className, size = 40, alt = "Panela da Roça", plate }: Props) {
  const img = (
    <img
      src={logo.url}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      className="select-none object-contain"
      style={{ width: size, height: size }}
    />
  );

  if (!plate) return <span className={cn("inline-flex", className)}>{img}</span>;

  const pad = Math.round(size * 0.28);
  return (
    <span
      className={cn(
        "inline-grid place-items-center rounded-2xl bg-[color:var(--wood)] shadow-[var(--shadow-soft)] ring-1 ring-white/5",
        className,
      )}
      style={{ padding: pad }}
    >
      {img}
    </span>
  );
}
