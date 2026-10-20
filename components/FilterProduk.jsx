"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function FilterProduk({ daftarKategori, kategoriAktif, cariAktif }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputCari, setInputCari] = useState(cariAktif);
  const urutAktif = searchParams.get("urut") || "terbaru";

  const handleKategori = (kat) => {
    const params = new URLSearchParams(searchParams.toString());
    if (kat) {
      params.set("kategori", kat);
    } else {
      params.delete("kategori");
    }
    params.delete("cari");
    params.delete("halaman"); // Reset ke halaman 1 saat ganti kategori
    router.push(`/?${params.toString()}`);
  };

  const handleCari = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.delete("kategori");
    params.delete("halaman"); // Reset ke halaman 1 saat cari
    if (inputCari.trim()) {
      params.set("cari", inputCari.trim());
    } else {
      params.delete("cari");
    }
    router.push(`/?${params.toString()}`);
  };

  const handleUrut = (urut) => {
    const params = new URLSearchParams(searchParams.toString());
    if (urut && urut !== "terbaru") {
      params.set("urut", urut);
    } else {
      params.delete("urut");
    }
    params.delete("halaman"); // Reset ke halaman 1 saat ganti urutan
    router.push(`/?${params.toString()}`);
  };

  const handleReset = () => {
    setInputCari("");
    router.push("/");
  };

  return (
    <div className="mb-6 flex flex-col gap-4">
      <form onSubmit={handleCari} className="flex gap-2">
        <input
          type="text"
          placeholder="Cari produk..."
          value={inputCari}
          onChange={(e) => setInputCari(e.target.value)}
          className="flex-1 rounded-lg border border-garis bg-latar px-4 py-2 text-sm focus:border-utama focus:outline-none focus:ring-2 focus:ring-utama/20"
        />
        <button
          type="submit"
          className="rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white hover:bg-utama-gelap"
        >
          Cari
        </button>
        {(kategoriAktif || cariAktif) && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-garis px-4 py-2 text-sm font-semibold text-teks hover:bg-permukaan"
          >
            Reset
          </button>
        )}
      </form>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {daftarKategori.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleKategori("")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                !kategoriAktif
                  ? "bg-utama text-white"
                  : "border border-garis bg-latar text-teks hover:bg-permukaan"
              }`}
            >
              Semua
            </button>
            {daftarKategori.map((kat) => (
              <button
                key={kat}
                onClick={() => handleKategori(kat)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  kategoriAktif === kat
                    ? "bg-utama text-white"
                    : "border border-garis bg-latar text-teks hover:bg-permukaan"
                }`}
              >
                {kat}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <label htmlFor="urut" className="text-sm font-medium text-teks-lembut whitespace-nowrap">
            Urutkan:
          </label>
          <select
            id="urut"
            value={urutAktif}
            onChange={(e) => handleUrut(e.target.value)}
            className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm font-medium text-teks focus:border-utama focus:outline-none focus:ring-2 focus:ring-utama/20"
          >
            <option value="terbaru">Terbaru</option>
            <option value="termurah">Termurah</option>
            <option value="termahal">Termahal</option>
          </select>
        </div>
      </div>
    </div>
  );
}
