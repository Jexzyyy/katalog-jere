import Link from "next/link";
import { notFound } from "next/navigation";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import KartuProduk from "@/components/KartuProduk";
import GaleriFoto from "@/components/GaleriFoto";
import { formatRupiah } from "@/lib/format";
import { buatClientServer } from "@/lib/supabase/server";

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;
  const supabase = buatClientServer();

  const { data: produk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !produk) {
    notFound();
  }

  // Ambil foto-foto dari galeri
  const { data: fotoList } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", id)
    .order("urutan", { ascending: true });

  const fotos = fotoList && fotoList.length > 0 ? fotoList : [];

  // Ambil produk terkait (kategori sama, kecuali produk ini)
  let produkTerkait = [];
  if (produk.kategori) {
    const { data: terkaitData } = await supabase
      .from("produk")
      .select("*")
      .eq("kategori", produk.kategori)
      .neq("id", id)
      .order("created_at", { ascending: false })
      .limit(4);

    if (terkaitData) {
      produkTerkait = terkaitData;
    }
  }

  const hargaAktif = produk.harga_diskon || produk.harga;
  const adaDiskon = produk.harga_diskon && produk.harga_diskon < produk.harga;
  const habis = produk.stok === 0;

  return (
    <>
      <article className="grid gap-8 py-8 md:grid-cols-2 md:py-12">
        <GaleriFoto fotos={fotos} namaProduk={produk.nama} habis={habis} />
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
            Kembali ke katalog
          </Link>
          <div className="flex items-center gap-2">
            <p className="text-sm text-teks-lembut">{produk.kategori}</p>
            {produk.badge && (
              <span className="rounded-md bg-utama px-2 py-0.5 text-xs font-semibold text-white">
                {produk.badge === "baru" ? "Baru" : "Terlaris"}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{produk.nama}</h1>
          <div className="flex flex-col gap-1">
            {adaDiskon && (
              <p className="text-sm text-teks-lembut line-through">
                <del>{formatRupiah(produk.harga)}</del>
              </p>
            )}
            <p className="self-start rounded-md bg-harga-latar px-3 py-1 text-xl font-bold text-harga">
              {formatRupiah(hargaAktif)}
            </p>
          </div>
          {habis && (
            <p className="text-sm text-bahaya font-semibold">Produk ini sedang habis</p>
          )}
          <p className="max-w-prose leading-relaxed text-teks-lembut">{produk.deskripsi}</p>
          <TombolWhatsApp produk={produk} disabled={habis} />
        </div>
      </article>

      {produkTerkait.length > 0 && (
        <section aria-labelledby="judul-terkait" className="py-8 border-t border-garis">
          <h2 id="judul-terkait" className="text-xl font-bold mb-5">
            Produk terkait dari kategori {produk.kategori}
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {produkTerkait.map((p) => (
              <KartuProduk key={p.id} produk={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
