import Link from "next/link";
import { formatRupiah } from "@/lib/format";

export default function KartuProduk({ produk }) {
  const hargaAktif = produk.harga_diskon || produk.harga;
  const adaDiskon = produk.harga_diskon && produk.harga_diskon < produk.harga;
  const habis = produk.stok === 0;

  // Gunakan foto utama dari galeri jika ada, jika tidak gunakan foto_url
  const fotoUrl = produk.foto_utama || produk.foto_url || "/produk/placeholder.svg";

  return (
    <Link
      href={`/produk/${produk.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar relative"
    >
      {/* Badge */}
      {produk.badge && (
        <div className="absolute top-2 left-2 z-10 rounded-md bg-utama px-2 py-0.5 text-xs font-semibold text-white">
          {produk.badge === "baru" ? "Baru" : "Terlaris"}
        </div>
      )}

      {/* Penanda Habis */}
      {habis && (
        <div className="absolute top-2 right-2 z-10 rounded-md bg-bahaya px-2 py-0.5 text-xs font-semibold text-white">
          Habis
        </div>
      )}

      <img
        src={fotoUrl}
        alt={produk.nama}
        className={`aspect-square w-full bg-permukaan object-cover ${habis ? "opacity-60" : ""}`}
      />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-xs text-teks-lembut">{produk.kategori}</p>
        <h3 className="font-semibold leading-snug group-hover:text-utama">{produk.nama}</h3>
        <div className="mt-auto flex flex-col gap-1">
          {adaDiskon && (
            <p className="text-xs text-teks-lembut line-through">
              <del>{formatRupiah(produk.harga)}</del>
            </p>
          )}
          <p className="self-start rounded-md bg-harga-latar px-2 py-0.5 text-sm font-bold text-harga">
            {formatRupiah(hargaAktif)}
          </p>
        </div>
      </div>
    </Link>
  );
}
