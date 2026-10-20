"use client";

import { useActionState, useState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

export default function FormProduk({ produk = {}, labelTombol, action }) {
  const [state, formAction, pending] = useActionState(action, {});
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi || "");
  const [loadingAI, setLoadingAI] = useState(false);
  const [errorAI, setErrorAI] = useState("");

  const handleGenerateDeskripsi = async (e) => {
    e.preventDefault();

    const form = e.target.closest("form");
    const nama = form.nama.value.trim();
    const kategori = form.kategori.value.trim();

    if (!nama) {
      setErrorAI("Isi nama produk terlebih dahulu.");
      return;
    }

    setLoadingAI(true);
    setErrorAI("");

    try {
      const response = await fetch("/api/generate-deskripsi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, kategori }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat deskripsi");
      }

      setDeskripsi(data.deskripsi);
    } catch (error) {
      setErrorAI(error.message || "Gagal membuat deskripsi. Silakan coba lagi.");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <form className="flex max-w-xl flex-col gap-4" action={formAction}>
      {state?.error && (
        <div className="rounded-lg border border-bahaya/20 bg-permukaan p-4 text-sm text-bahaya">
          {state.error}
        </div>
      )}
      <Input label="Nama produk" name="nama" defaultValue={produk.nama} required />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
      />
      <Input
        label="Harga diskon (Rp, opsional)"
        name="harga_diskon"
        type="number"
        min="0"
        defaultValue={produk.harga_diskon}
        placeholder="Kosongkan jika tidak ada diskon"
      />
      <Input
        label="Stok"
        name="stok"
        type="number"
        min="0"
        defaultValue={produk.stok ?? 10}
        required
      />
      <div className="flex flex-col gap-2">
        <label htmlFor="badge" className="block text-sm font-semibold text-teks">
          Badge (opsional)
        </label>
        <select
          id="badge"
          name="badge"
          defaultValue={produk.badge || ""}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks focus:border-utama focus:outline-none focus:ring-2 focus:ring-utama/20"
        >
          <option value="">Tidak ada</option>
          <option value="baru">Baru</option>
          <option value="terlaris">Terlaris</option>
        </select>
      </div>
      <Input label="Kategori" name="kategori" defaultValue={produk.kategori} required />
      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="deskripsi" className="block text-sm font-semibold text-teks">
            Deskripsi
          </label>
          <button
            type="button"
            onClick={handleGenerateDeskripsi}
            disabled={loadingAI || pending}
            className="rounded-md border border-utama px-3 py-1 text-xs font-semibold text-utama hover:bg-utama hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingAI ? "Membuat..." : "Buat dengan AI"}
          </button>
        </div>
        <textarea
          id="deskripsi"
          name="deskripsi"
          rows={4}
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder-teks-lembut focus:border-utama focus:outline-none focus:ring-2 focus:ring-utama/20"
        />
        {errorAI && <p className="text-sm text-bahaya">{errorAI}</p>}
      </div>
      <div className="flex gap-3">
        <Tombol type="submit" disabled={pending || loadingAI}>
          {pending ? "Menyimpan..." : labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
