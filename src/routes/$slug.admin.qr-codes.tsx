import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { Download, FileDown, Plus, QrCode as QrIcon, Trash2, RefreshCw } from "lucide-react";

import { getRestaurantBySlug } from "@/lib/hub/api";
import type { Restaurant } from "@/lib/hub/types";
import { NotFoundRestaurant } from "@/components/hub/NotFoundRestaurant";
import { AdminShell } from "@/components/admin/AdminShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$slug/admin/qr-codes")({
  loader: async ({ params }) => {
    const restaurant = await getRestaurantBySlug(params.slug);
    return { restaurant: restaurant as Restaurant | null };
  },
  head: () => ({ meta: [{ title: "QR & Links · Admin" }] }),
  component: QrCodesPage,
});

type Source = "qr" | "nfc";
type Point = { id: string; label: string; source: Source; code: string };

const STORAGE_KEY = (slug: string) => `admin:qr-points:${slug}`;

const DEFAULT_POINTS: Point[] = [
  { id: crypto.randomUUID(), label: "Mesa 01", source: "qr", code: "mesa-01" },
  { id: crypto.randomUUID(), label: "Mesa 02", source: "qr", code: "mesa-02" },
  { id: crypto.randomUUID(), label: "Mesa 03", source: "qr", code: "mesa-03" },
  { id: crypto.randomUUID(), label: "Cardápio", source: "qr", code: "cardapio" },
  { id: crypto.randomUUID(), label: "Balcão (NFC)", source: "nfc", code: "balcao" },
];

function slugify(v: string) {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

function buildUrl(baseUrl: string, slug: string, p: Point) {
  const base = baseUrl.replace(/\/+$/, "");
  const params = new URLSearchParams({ src: p.source });
  if (p.code) params.set("t", p.code);
  return `${base}/${slug}?${params.toString()}`;
}

function QrCodesPage() {
  const { restaurant } = Route.useLoaderData();
  if (!restaurant) return <NotFoundRestaurant />;

  const defaultBase = typeof window !== "undefined" ? window.location.origin : "";

  const [baseUrl, setBaseUrl] = useState<string>(defaultBase);
  const [points, setPoints] = useState<Point[]>(DEFAULT_POINTS);
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_POINTS[0].id);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY(restaurant.slug));
      if (stored) {
        const parsed = JSON.parse(stored) as { baseUrl?: string; points?: Point[] };
        if (parsed.baseUrl) setBaseUrl(parsed.baseUrl);
        if (Array.isArray(parsed.points) && parsed.points.length > 0) {
          setPoints(parsed.points);
          setSelectedId(parsed.points[0].id);
        }
      }
    } catch {}
  }, [restaurant.slug]);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY(restaurant.slug),
        JSON.stringify({ baseUrl, points }),
      );
    } catch {}
  }, [baseUrl, points, restaurant.slug]);

  const selected = points.find((p) => p.id === selectedId) ?? points[0];

  const addPoint = (source: Source) => {
    const n = points.filter((p) => p.source === source).length + 1;
    const label = source === "qr" ? `Novo ponto ${n}` : `NFC ${n}`;
    const p: Point = {
      id: crypto.randomUUID(),
      label,
      source,
      code: slugify(label),
    };
    setPoints((prev) => [...prev, p]);
    setSelectedId(p.id);
  };

  const updatePoint = (id: string, patch: Partial<Point>) => {
    setPoints((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const removePoint = (id: string) => {
    setPoints((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (selectedId === id && next[0]) setSelectedId(next[0].id);
      return next;
    });
  };

  return (
    <AdminShell
      restaurant={restaurant}
      title="QR Codes & Links"
      action={
        <button
          onClick={() => downloadPdfSheet(baseUrl, restaurant, points)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <FileDown className="size-4" /> Exportar folha PDF
        </button>
      }
    >
      <div className="space-y-6">
        {/* Base URL */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Domínio público do Hub
            </span>
            <div className="flex gap-2">
              <input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://seudominio.com"
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-[color:var(--copper)] focus:outline-none focus:ring-2 focus:ring-[color:var(--copper)]/20"
              />
              <button
                onClick={() => setBaseUrl(defaultBase)}
                title="Usar domínio atual"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-secondary"
              >
                <RefreshCw className="size-3.5" /> Atual
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Cole aqui o domínio final quando publicar em outro lugar (ex.: <code className="rounded bg-muted px-1">panelaroca.com.br</code>). Os QR codes usam essa base.
            </p>
          </label>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Lista de pontos */}
          <section className="rounded-2xl border border-border bg-card">
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-lg">Pontos de contato</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => addPoint("qr")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary"
                >
                  <Plus className="size-3.5" /> QR
                </button>
                <button
                  onClick={() => addPoint("nfc")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary"
                >
                  <Plus className="size-3.5" /> NFC
                </button>
              </div>
            </header>

            <ul className="divide-y divide-border">
              {points.map((p) => {
                const url = buildUrl(baseUrl, restaurant.slug, p);
                const active = p.id === selectedId;
                return (
                  <li
                    key={p.id}
                    className={cn(
                      "grid grid-cols-[auto_1fr_1fr_auto_auto] items-center gap-3 px-5 py-3 transition",
                      active && "bg-secondary/40",
                    )}
                  >
                    <button
                      onClick={() => setSelectedId(p.id)}
                      className={cn(
                        "grid size-9 place-items-center rounded-lg border text-[10px] font-bold uppercase tracking-wider",
                        p.source === "qr"
                          ? "border-[color:var(--copper)]/40 bg-[color:var(--copper)]/10 text-[color:var(--copper)]"
                          : "border-[color:var(--sage)]/40 bg-[color:var(--sage)]/10 text-[color:var(--sage)]",
                      )}
                    >
                      {p.source}
                    </button>
                    <input
                      value={p.label}
                      onChange={(e) => updatePoint(p.id, { label: e.target.value })}
                      onFocus={() => setSelectedId(p.id)}
                      className="min-w-0 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm hover:border-border focus:border-[color:var(--copper)] focus:outline-none"
                    />
                    <input
                      value={p.code}
                      onChange={(e) => updatePoint(p.id, { code: slugify(e.target.value) })}
                      onFocus={() => setSelectedId(p.id)}
                      placeholder="mesa-01"
                      className="min-w-0 rounded-lg border border-transparent bg-transparent px-2 py-1.5 font-mono text-xs text-muted-foreground hover:border-border focus:border-[color:var(--copper)] focus:outline-none"
                    />
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="hidden max-w-[220px] truncate text-xs text-muted-foreground hover:text-foreground md:block"
                      title={url}
                    >
                      {url.replace(/^https?:\/\//, "")}
                    </a>
                    <button
                      onClick={() => removePoint(p.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remover"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                );
              })}
              {points.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                  Nenhum ponto ainda. Adicione um QR ou NFC.
                </li>
              )}
            </ul>
          </section>

          {/* Preview */}
          {selected && (
            <aside className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                <QrIcon className="size-3.5" /> Preview
              </div>
              <QrPreview url={buildUrl(baseUrl, restaurant.slug, selected)} label={selected.label} />
              <div className="mt-4 space-y-2">
                <div className="rounded-lg bg-muted px-3 py-2 font-mono text-[11px] break-all">
                  {buildUrl(baseUrl, restaurant.slug, selected)}
                </div>
                <button
                  onClick={() =>
                    downloadPng(buildUrl(baseUrl, restaurant.slug, selected), selected.label)
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  <Download className="size-4" /> Baixar PNG (1024px)
                </button>
              </div>
            </aside>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

function QrPreview({ url, label }: { url: string; label: string }) {
  const [dataUrl, setDataUrl] = useState<string>("");
  useEffect(() => {
    QRCode.toDataURL(url, {
      margin: 1,
      width: 512,
      color: { dark: "#3c2a21", light: "#faf6f0" },
      errorCorrectionLevel: "H",
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [url]);

  return (
    <div className="rounded-xl border border-border bg-[#faf6f0] p-4 text-center">
      {dataUrl ? (
        <img src={dataUrl} alt={`QR ${label}`} className="mx-auto aspect-square w-full max-w-[240px]" />
      ) : (
        <div className="mx-auto aspect-square w-full max-w-[240px] animate-pulse rounded-lg bg-muted" />
      )}
      <div className="mt-3 font-display text-sm text-[#3c2a21]">{label}</div>
    </div>
  );
}

async function downloadPng(url: string, label: string) {
  const dataUrl = await QRCode.toDataURL(url, {
    margin: 2,
    width: 1024,
    color: { dark: "#3c2a21", light: "#faf6f0" },
    errorCorrectionLevel: "H",
  });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `qr-${slugify(label) || "code"}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function downloadPdfSheet(baseUrl: string, restaurant: Restaurant, points: Point[]) {
  if (points.length === 0) return;
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const cols = 2;
  const rows = 3;
  const perPage = cols * rows;
  const marginX = 15;
  const marginY = 15;
  const cellW = (pageW - marginX * 2) / cols;
  const cellH = (pageH - marginY * 2) / rows;

  for (let i = 0; i < points.length; i++) {
    if (i > 0 && i % perPage === 0) pdf.addPage();
    const p = points[i];
    const idxOnPage = i % perPage;
    const col = idxOnPage % cols;
    const row = Math.floor(idxOnPage / cols);
    const x = marginX + col * cellW;
    const y = marginY + row * cellH;
    const url = buildUrl(baseUrl, restaurant.slug, p);

    const qrData = await QRCode.toDataURL(url, {
      margin: 1,
      width: 1024,
      color: { dark: "#3c2a21", light: "#faf6f0" },
      errorCorrectionLevel: "H",
    });

    // frame
    pdf.setDrawColor(220, 210, 195);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(x + 2, y + 2, cellW - 4, cellH - 4, 3, 3);

    // header label
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(180, 120, 70);
    pdf.text(restaurant.name.toUpperCase(), x + cellW / 2, y + 10, { align: "center" });

    // QR
    const qrSize = Math.min(cellW, cellH) - 40;
    const qrX = x + (cellW - qrSize) / 2;
    const qrY = y + 14;
    pdf.addImage(qrData, "PNG", qrX, qrY, qrSize, qrSize);

    // label
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(60, 42, 33);
    pdf.text(p.label, x + cellW / 2, qrY + qrSize + 10, { align: "center" });

    // source hint
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(140, 130, 120);
    pdf.text(
      p.source === "qr" ? "Aponte a câmera do celular" : "Encoste o celular na tag NFC",
      x + cellW / 2,
      qrY + qrSize + 16,
      { align: "center" },
    );
  }

  pdf.save(`qr-codes-${restaurant.slug}.pdf`);
}