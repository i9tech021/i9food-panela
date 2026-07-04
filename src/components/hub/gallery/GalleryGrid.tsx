import type { Photo } from "@/lib/hub/types";
import { GalleryCard } from "./GalleryCard";

interface Props {
  photos: Photo[];
  slug: string;
}

/** Grid responsivo da galeria. */
export function GalleryGrid({ photos, slug }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((p, i) => (
        <GalleryCard key={p.id} photo={p} slug={slug} priority={i < 2} />
      ))}
    </div>
  );
}
