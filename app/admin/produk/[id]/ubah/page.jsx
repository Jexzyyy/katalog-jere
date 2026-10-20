import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import GaleriFotoForm from "@/components/GaleriFotoForm";
import { ubahProduk } from "@/app/admin/actions";
import { buatClientServer } from "@/lib/supabase/server";

export default async function HalamanUbahProduk({ params }) {
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

  const ubahProdukDenganId = ubahProduk.bind(null, id);

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      <FormProduk produk={produk} labelTombol="Simpan perubahan" action={ubahProdukDenganId} />
      <div className="max-w-xl border-t border-garis pt-6">
        <GaleriFotoForm produkId={id} fotoList={fotoList || []} />
      </div>
    </div>
  );
}
