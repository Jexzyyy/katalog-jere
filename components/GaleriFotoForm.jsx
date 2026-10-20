"use client";

import { useState, useTransition } from "react";
import { tambahFotoGaleri, hapusFotoGaleri, updateUrutanFoto } from "@/app/admin/actions";

export default function GaleriFotoForm({ produkId, fotoList = [] }) {
  const [fotos, setFotos] = useState(fotoList);
  const [urlBaru, setUrlBaru] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleTambah = (e) => {
    e.preventDefault();
    if (!urlBaru.trim()) {
      setError("URL foto harus diisi");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        await tambahFotoGaleri(produkId, urlBaru.trim(), fotos.length);
        // Tambahkan ke state lokal untuk UX yang lebih responsif
        setFotos([...fotos, { id: Date.now(), url: urlBaru.trim(), urutan: fotos.length }]);
        setUrlBaru("");
      } catch (err) {
        setError(err.message);
      }
    });
  };

  const handleHapus = (imageId) => {
    if (!confirm("Hapus foto ini?")) return;

    startTransition(async () => {
      try {
        await hapusFotoGaleri(imageId, produkId);
        setFotos(fotos.filter((f) => f.id !== imageId));
      } catch (err) {
        setError(err.message);
      }
    });
  };

  const handleNaik = (index) => {
    if (index === 0) return;

    startTransition(async () => {
      try {
        const foto = fotos[index];
        await updateUrutanFoto(foto.id, index - 1, produkId);

        const newFotos = [...fotos];
        [newFotos[index - 1], newFotos[index]] = [newFotos[index], newFotos[index - 1]];
        setFotos(newFotos);
      } catch (err) {
        setError(err.message);
      }
    });
  };

  const handleTurun = (index) => {
    if (index === fotos.length - 1) return;

    startTransition(async () => {
      try {
        const foto = fotos[index];
        await updateUrutanFoto(foto.id, index + 1, produkId);

        const newFotos = [...fotos];
        [newFotos[index], newFotos[index + 1]] = [newFotos[index + 1], newFotos[index]];
        setFotos(newFotos);
      } catch (err) {
        setError(err.message);
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="block text-sm font-semibold text-teks">Galeri foto</label>
        <p className="text-xs text-teks-lembut">
          Foto pertama akan menjadi foto utama. Tambahkan beberapa foto untuk galeri.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-bahaya/10 px-3 py-2 text-sm text-bahaya">{error}</div>
      )}

      {/* Daftar foto existing */}
      {fotos.length > 0 && (
        <div className="flex flex-col gap-2">
          {fotos.map((foto, index) => (
            <div
              key={foto.id}
              className="flex items-center gap-3 rounded-lg border border-garis bg-latar p-3"
            >
              <img
                src={foto.url}
                alt={`Foto ${index + 1}`}
                className="h-16 w-16 rounded border border-garis bg-permukaan object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-teks truncate">{foto.url}</p>
                <p className="text-xs text-teks-lembut">
                  {index === 0 ? "Foto utama" : `Foto ${index + 1}`}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleNaik(index)}
                  disabled={index === 0 || isPending}
                  className="rounded border border-garis px-2 py-1 text-xs font-medium text-teks hover:bg-permukaan disabled:cursor-not-allowed disabled:opacity-50"
                  title="Naikkan urutan"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleTurun(index)}
                  disabled={index === fotos.length - 1 || isPending}
                  className="rounded border border-garis px-2 py-1 text-xs font-medium text-teks hover:bg-permukaan disabled:cursor-not-allowed disabled:opacity-50"
                  title="Turunkan urutan"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => handleHapus(foto.id)}
                  disabled={isPending}
                  className="rounded border border-bahaya px-2 py-1 text-xs font-medium text-bahaya hover:bg-bahaya hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form tambah foto baru */}
      <form onSubmit={handleTambah} className="flex gap-2">
        <input
          type="text"
          value={urlBaru}
          onChange={(e) => setUrlBaru(e.target.value)}
          placeholder="https://... atau /produk/nama-file.svg"
          disabled={isPending}
          className="flex-1 rounded-lg border border-garis bg-latar px-3 py-2 text-sm focus:border-utama focus:outline-none focus:ring-2 focus:ring-utama/20 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending || !urlBaru.trim()}
          className="rounded-lg border border-utama px-4 py-2 text-sm font-semibold text-utama hover:bg-utama hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Menambah..." : "Tambah Foto"}
        </button>
      </form>
    </div>
  );
}
