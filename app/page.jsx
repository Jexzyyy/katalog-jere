import KartuProduk from "@/components/KartuProduk";
import FilterProduk from "@/components/FilterProduk";
import { toko } from "@/lib/toko";
import { buatClientServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog({ searchParams }) {
  const params = await searchParams;
  const kategori = params?.kategori || "";
  const cari = params?.cari || "";

  let daftarProduk = [];
  let daftarKategori = [];
  let pesanError = null;

  try {
    const supabase = buatClientServer();

    // Ambil daftar kategori unik
    const { data: kategoriData } = await supabase
      .from("produk")
      .select("kategori")
      .order("kategori");

    if (kategoriData) {
      const uniqueKategori = [...new Set(kategoriData.map((p) => p.kategori).filter(Boolean))];
      daftarKategori = uniqueKategori;
    }

    // Query produk dengan filter
    let query = supabase.from("produk").select("*");

    if (kategori) {
      query = query.eq("kategori", kategori);
    }

    if (cari) {
      query = query.ilike("nama", `%${cari}%`);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      pesanError = error.message;
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    pesanError = err.message || "Gagal mengambil data produk dari server.";
  }

  const judulHasil = kategori
    ? `Produk kategori ${kategori}`
    : cari
      ? `Hasil pencarian "${cari}"`
      : "Produk kami";

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <FilterProduk daftarKategori={daftarKategori} kategoriAktif={kategori} cariAktif={cari} />

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          {judulHasil}
        </h2>
        {pesanError ? (
          <div className="rounded-lg border border-bahaya/20 bg-permukaan p-4 text-sm text-bahaya">
            <p className="font-semibold">Gagal memuat produk</p>
            <p className="mt-1 text-teks-lembut">{pesanError}</p>
          </div>
        ) : daftarProduk.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-teks-lembut">
              {kategori || cari ? "Tidak ada produk yang sesuai" : "Belum ada produk"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
