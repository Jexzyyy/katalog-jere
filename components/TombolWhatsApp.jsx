"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function TombolWhatsApp({ produk }) {
  const [jumlah, setJumlah] = useState(1);
  const [catatan, setCatatan] = useState("");

  const handlePesan = () => {
    let pesan = `Halo, saya tertarik dengan *${produk.nama}* - ${formatRupiah(produk.harga)}`;

    if (jumlah > 1) {
      pesan += `\nJumlah: ${jumlah}`;
    }

    if (catatan.trim()) {
      pesan += `\nCatatan: ${catatan.trim()}`;
    }

    const urlWhatsApp = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;
    window.open(urlWhatsApp, "_blank", "noopener,noreferrer");
  };

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
          value={jumlah}
          onChange={(e) => setJumlah(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-24 rounded-lg border border-garis bg-latar px-3 py-2 text-sm focus:border-utama focus:outline-none focus:ring-2 focus:ring-utama/20"
        />
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

