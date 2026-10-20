import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { buatClientServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin() {
  let daftarProduk = [];
  let pesanError = null;

  try {
    const supabase = buatClientServer();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      pesanError = error.message;
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    pesanError = err.message || "Gagal mengambil data produk dari server.";
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>
      {pesanError ? (
        <div className="rounded-lg border border-bahaya/20 bg-permukaan p-4 text-sm text-bahaya">
          <p className="font-semibold">Gagal memuat produk</p>
          <p className="mt-1 text-teks-lembut">{pesanError}</p>
        </div>
      ) : daftarProduk.length === 0 ? (
        <p className="py-8 text-center text-teks-lembut">Belum ada produk</p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
