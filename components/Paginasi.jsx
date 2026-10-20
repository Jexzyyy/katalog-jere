"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function Paginasi({ halamanSekarang, totalHalaman }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalHalaman <= 1) {
    return null;
  }

  const handleHalaman = (halaman) => {
    const params = new URLSearchParams(searchParams.toString());
    if (halaman > 1) {
      params.set("halaman", halaman.toString());
    } else {
      params.delete("halaman");
    }
    router.push(`/?${params.toString()}`);
  };

  // Hitung range nomor halaman yang ditampilkan
  const rangeHalaman = [];
  const maxTampil = 5; // Maksimal 5 nomor halaman ditampilkan sekaligus
  let mulai = Math.max(1, halamanSekarang - Math.floor(maxTampil / 2));
  let akhir = Math.min(totalHalaman, mulai + maxTampil - 1);

  // Adjust jika di ujung
  if (akhir - mulai + 1 < maxTampil) {
    mulai = Math.max(1, akhir - maxTampil + 1);
  }

  for (let i = mulai; i <= akhir; i++) {
    rangeHalaman.push(i);
  }

  return (
    <nav aria-label="Navigasi halaman" className="flex items-center justify-center gap-2">
      <button
        onClick={() => handleHalaman(halamanSekarang - 1)}
        disabled={halamanSekarang <= 1}
        className="rounded-lg border border-garis bg-latar px-3 py-2 text-sm font-medium text-teks hover:bg-permukaan disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Halaman sebelumnya"
      >
        Sebelumnya
      </button>

      <div className="flex gap-1">
        {mulai > 1 && (
          <>
            <button
              onClick={() => handleHalaman(1)}
              className="rounded-lg border border-garis bg-latar px-3 py-2 text-sm font-medium text-teks hover:bg-permukaan"
            >
              1
            </button>
            {mulai > 2 && <span className="px-2 py-2 text-sm text-teks-lembut">...</span>}
          </>
        )}

        {rangeHalaman.map((hal) => (
          <button
            key={hal}
            onClick={() => handleHalaman(hal)}
            disabled={hal === halamanSekarang}
            aria-current={hal === halamanSekarang ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              hal === halamanSekarang
                ? "bg-utama text-white"
                : "border border-garis bg-latar text-teks hover:bg-permukaan"
            }`}
          >
            {hal}
          </button>
        ))}

        {akhir < totalHalaman && (
          <>
            {akhir < totalHalaman - 1 && <span className="px-2 py-2 text-sm text-teks-lembut">...</span>}
            <button
              onClick={() => handleHalaman(totalHalaman)}
              className="rounded-lg border border-garis bg-latar px-3 py-2 text-sm font-medium text-teks hover:bg-permukaan"
            >
              {totalHalaman}
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => handleHalaman(halamanSekarang + 1)}
        disabled={halamanSekarang >= totalHalaman}
        className="rounded-lg border border-garis bg-latar px-3 py-2 text-sm font-medium text-teks hover:bg-permukaan disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Halaman berikutnya"
      >
        Berikutnya
      </button>
    </nav>
  );
}
