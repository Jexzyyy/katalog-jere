"use client";

import { useState } from "react";

export default function GaleriFoto({ fotos, namaProduk, habis = false }) {
  const [fotoAktif, setFotoAktif] = useState(0);

  // Jika tidak ada foto, tampilkan placeholder
  if (fotos.length === 0) {
    return (
      <div className="relative">
        <div className="aspect-square w-full rounded-2xl border border-garis bg-permukaan flex items-center justify-center">
          <p className="text-teks-lembut">Tidak ada foto</p>
        </div>
        {habis && (
          <div className="absolute top-4 right-4 rounded-md bg-bahaya px-3 py-1.5 text-sm font-semibold text-white">
            Habis
          </div>
        )}
      </div>
    );
  }

  // Jika hanya ada 1 foto, tampilkan tanpa thumbnail
  if (fotos.length === 1) {
    return (
      <div className="relative">
        <img
          src={fotos[0].url}
          alt={namaProduk}
          className={`aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover ${habis ? "opacity-60" : ""}`}
        />
        {habis && (
          <div className="absolute top-4 right-4 rounded-md bg-bahaya px-3 py-1.5 text-sm font-semibold text-white">
            Habis
          </div>
        )}
      </div>
    );
  }

  // Jika ada banyak foto, tampilkan galeri dengan thumbnail
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <img
          src={fotos[fotoAktif].url}
          alt={`${namaProduk} - foto ${fotoAktif + 1}`}
          className={`aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover ${habis ? "opacity-60" : ""}`}
        />
        {habis && (
          <div className="absolute top-4 right-4 rounded-md bg-bahaya px-3 py-1.5 text-sm font-semibold text-white">
            Habis
          </div>
        )}
      </div>

      {/* Thumbnail */}
      <div className="grid grid-cols-4 gap-2">
        {fotos.map((foto, index) => (
          <button
            key={foto.id}
            onClick={() => setFotoAktif(index)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setFotoAktif(index);
              }
            }}
            className={`aspect-square rounded-lg border-2 bg-permukaan transition-all ${
              index === fotoAktif
                ? "border-utama ring-2 ring-utama/20"
                : "border-garis hover:border-utama/50"
            }`}
            aria-label={`Lihat foto ${index + 1}`}
            aria-current={index === fotoAktif ? "true" : "false"}
          >
            <img
              src={foto.url}
              alt={`${namaProduk} thumbnail ${index + 1}`}
              className="h-full w-full rounded-md object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
