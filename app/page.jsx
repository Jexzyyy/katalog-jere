import KartuProduk from "@/components/KartuProduk";
import FilterProduk from "@/components/FilterProduk";
import Paginasi from "@/components/Paginasi";
import { toko } from "@/lib/toko";
import { buatClientServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const PRODUK_PER_HALAMAN = 12;

export default async function HalamanKatalog({ searchParams }) {
  const params = await searchParams;
  const kategori = params?.kategori || "";
  const cari = params?.cari || "";
  const urut = params?.urut || "terbaru";
  const halamanParam = parseInt(params?.halaman || "1", 10);

  let daftarProduk = [];
  let daftarKategori = [];
  let pesanError = null;
  let totalProduk = 0;
  let halamanSekarang = Math.max(1, halamanParam);

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

    // Query COUNT dan data produk secara paralel
    // Build kondisi filter yang sama untuk kedua query
    let countQuery = supabase.from("produk").select("*", { count: "exact", head: true });
    // Untuk data query, kita ambil juga foto utama (urutan terendah) dari product_images
    let dataQuery = supabase
      .from("produk")
      .select(`
        *,
        product_images!product_images_product_id_fkey(url, urutan)
      `);

    if (kategori) {
      countQuery = countQuery.eq("kategori", kategori);
      dataQuery = dataQuery.eq("kategori", kategori);
    }

    if (cari) {
      countQuery = countQuery.ilike("nama", `%${cari}%`);
      dataQuery = dataQuery.ilike("nama", `%${cari}%`);
    }

    // Validasi dan terapkan urutan (whitelist untuk keamanan)
    const urutValid = ["terbaru", "termurah", "termahal"];
    const urutTerpilih = urutValid.includes(urut) ? urut : "terbaru";

    if (urutTerpilih === "termurah") {
      dataQuery = dataQuery.order("harga_diskon", { ascending: true, nullsFirst: false })
                           .order("harga", { ascending: true })
                           .order("id", { ascending: true }); // tie-breaker
    } else if (urutTerpilih === "termahal") {
      dataQuery = dataQuery.order("harga_diskon", { ascending: false, nullsFirst: true })
                           .order("harga", { ascending: false })
                           .order("id", { ascending: true }); // tie-breaker
    } else {
      // terbaru (default)
      dataQuery = dataQuery.order("created_at", { ascending: false })
                           .order("id", { ascending: false }); // tie-breaker
    }

    // Hitung offset
    const offset = (halamanSekarang - 1) * PRODUK_PER_HALAMAN;

    // Apply LIMIT dan OFFSET
    dataQuery = dataQuery.range(offset, offset + PRODUK_PER_HALAMAN - 1);

    // Jalankan kedua query secara paralel
    const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

    if (countResult.error) {
      pesanError = countResult.error.message;
    } else {
      totalProduk = countResult.count || 0;
    }

    if (dataResult.error) {
      pesanError = dataResult.error.message;
    } else {
      // Transform product_images ke foto_utama (ambil foto dengan urutan terendah)
      let hasil = (dataResult.data || []).map((p) => {
        const fotos = p.product_images || [];
        const fotoTersortir = fotos.sort((a, b) => a.urutan - b.urutan);
        return {
          ...p,
          foto_utama: fotoTersortir[0]?.url || null,
          product_images: undefined, // hapus dari hasil
        };
      });
      if (urutTerpilih === "termurah") {
        hasil.sort((a, b) => {
          const hargaA = a.harga_diskon || a.harga;
          const hargaB = b.harga_diskon || b.harga;
          if (hargaA !== hargaB) return hargaA - hargaB;
          return a.id - b.id; // tie-breaker
        });
      } else if (urutTerpilih === "termahal") {
        hasil.sort((a, b) => {
          const hargaA = a.harga_diskon || a.harga;
          const hargaB = b.harga_diskon || b.harga;
          if (hargaA !== hargaB) return hargaB - hargaA;
          return a.id - b.id; // tie-breaker
        });
      }
      daftarProduk = hasil;
    }
  } catch (err) {
    pesanError = err.message || "Gagal mengambil data produk dari server.";
  }

  // Hitung total halaman
  const totalHalaman = Math.ceil(totalProduk / PRODUK_PER_HALAMAN);

  // Validasi halaman: jika melebihi total halaman, arahkan ke halaman terakhir
  if (totalHalaman > 0 && halamanSekarang > totalHalaman) {
    halamanSekarang = totalHalaman;
  }

  const judulHasil = kategori
    ? `Produk kategori ${kategori}`
    : cari
      ? `Hasil pencarian "${cari}"`
      : "Produk kami";

  const infoHalaman = totalHalaman > 1
    ? ` (Halaman ${halamanSekarang} dari ${totalHalaman})`
    : "";

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
          {infoHalaman && <span className="text-base font-normal text-teks-lembut">{infoHalaman}</span>}
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
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {daftarProduk.map((produk) => (
                <KartuProduk key={produk.id} produk={produk} />
              ))}
            </div>
            <Paginasi halamanSekarang={halamanSekarang} totalHalaman={totalHalaman} />
          </>
        )}
      </section>
    </>
  );
}
