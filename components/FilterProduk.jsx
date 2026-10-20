"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function FilterProduk({ daftarKategori, kategoriAktif, cariAktif }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputCari, setInputCari] = useState(cariAktif);

  const handleKategori = (kat) => {
    const params = new URLSearchParams(searchParams.toString());
    if (kat) {
      params.set("kategori", kat);
    } else {
      params.delete("kategori");
    }
    params.delete("cari");
    router.push(`/?${params.toString()}`);
  };

  const handleCari = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (inputCari.trim()) {
      params.set("cari", inputCari.trim());
    }
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
    </div>
  );
}
