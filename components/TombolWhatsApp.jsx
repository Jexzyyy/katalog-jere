"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function TombolWhatsApp({ produk, disabled = false }) {
  const [jumlah, setJumlah] = useState(1);
  const [catatan, setCatatan] = useState("");

  const hargaAktif = produk.harga_diskon || produk.harga;

  const handlePesan = () => {
    if (disabled) return;

    let pesan = `Halo, saya tertarik dengan *${produk.nama}* - ${formatRupiah(hargaAktif)}`;

    if (jumlah > 1) {
      pesan += `\nJumlah: ${jumlah}`;
    }

    if (catatan.trim()) {
      pesan += `\nCatatan: ${catatan.trim()}`;
    }

    const urlWhatsApp = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;
    window.open(urlWhatsApp, "_blank", "noopener,noreferrer");
  };

  if (disabled) {
    return (
      <div className="rounded-lg border border-garis bg-permukaan p-4">
        <p className="text-sm text-teks-lembut text-center">
          Produk ini sedang habis dan tidak dapat dipesan
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label htmlFor="jumlah" className="text-sm font-semibold text-teks">
          Jumlah
        </label>
        <input
          type="number"
          id="jumlah"
          min="1"
          max={produk.stok || 999}
          value={jumlah}
          onChange={(e) => {
            const val = Math.max(1, parseInt(e.target.value) || 1);
            const maxVal = produk.stok || 999;
            setJumlah(Math.min(val, maxVal));
          }}
          className="w-24 rounded-lg border border-garis bg-latar px-3 py-2 text-sm focus:border-utama focus:outline-none focus:ring-2 focus:ring-utama/20"
        />
        {produk.stok && (
          <p className="text-xs text-teks-lembut">Stok tersedia: {produk.stok}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="catatan" className="text-sm font-semibold text-teks">
          Catatan (opsional)
        </label>
        <input
          type="text"
          id="catatan"
          placeholder="Contoh: ukuran, warna, varian..."
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          className="rounded-lg border border-garis bg-latar px-3 py-2 text-sm focus:border-utama focus:outline-none focus:ring-2 focus:ring-utama/20"
        />
      </div>

      <button
        onClick={handlePesan}
        className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
      >
        Pesan via WhatsApp
      </button>
    </div>
  );
}
