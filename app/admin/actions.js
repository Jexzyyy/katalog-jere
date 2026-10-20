"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientAuth } from "@/lib/supabase/server";

// Helper: periksa admin sudah login. Kembalikan user atau lempar error.
// Wajib dipakai oleh setiap Server Action yang mengubah data (aturan keamanan #3).
export async function periksaLogin() {
  const supabase = await buatClientAuth();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Anda harus login terlebih dahulu.");
  }

  return { supabase, user };
}

export async function login(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Email dan password harus diisi." };
  }

  const supabase = await buatClientAuth();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Email atau password salah." };
  }

  redirect("/admin");
}

export async function logout() {
  try {
    const { supabase } = await periksaLogin();
    await supabase.auth.signOut();
  } catch {
    // Abaikan error jika sesi memang sudah tidak aktif
  }
  redirect("/admin/login");
}

export async function gantiPassword(prevState, formData) {
  const passwordBaru = formData.get("password_baru");
  const konfirmasi = formData.get("konfirmasi_password");

  // Validasi: tidak boleh kosong
  if (!passwordBaru || !konfirmasi) {
    return { error: "Password baru dan konfirmasi harus diisi." };
  }

  // Validasi: minimal 8 karakter
  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  // Validasi: password baru harus sama dengan konfirmasi
  if (passwordBaru !== konfirmasi) {
    return { error: "Password baru dan konfirmasi tidak sama." };
  }

  let supabase;
  try {
    const auth = await periksaLogin();
    supabase = auth.supabase;
  } catch {
    return { error: "Anda harus login terlebih dahulu." };
  }

  // Ganti password lewat Supabase Auth
  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    return { error: "Gagal mengganti password. " + error.message };
  }

  return { success: "Password berhasil diganti." };
}

// US-08: Tambah produk
export async function tambahProduk(prevState, formData) {
  // Validasi login di server
  let supabase;
  try {
    const auth = await periksaLogin();
    supabase = auth.supabase;
  } catch {
    return { error: "Anda harus login terlebih dahulu." };
  }

  // Ambil data dari form
  const nama = formData.get("nama")?.trim();
  const hargaStr = formData.get("harga");
  const kategori = formData.get("kategori")?.trim();
  const foto_url = formData.get("foto_url")?.trim();
  const deskripsi = formData.get("deskripsi")?.trim();

  // Validasi input
  if (!nama) {
    return { error: "Nama produk harus diisi." };
  }

  const harga = parseInt(hargaStr, 10);
  if (isNaN(harga) || harga < 0) {
    return { error: "Harga harus berupa angka 0 atau lebih." };
  }

  if (!kategori) {
    return { error: "Kategori harus diisi." };
  }

  // Simpan ke database
  const { error } = await supabase.from("produk").insert({
    nama,
    harga,
    kategori,
    foto_url: foto_url || null,
    deskripsi: deskripsi || null,
  });

  if (error) {
    return { error: "Gagal menyimpan produk: " + error.message };
  }

  // Revalidate cache dan redirect
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

// US-09: Ubah produk
export async function ubahProduk(id, prevState, formData) {
  // Validasi login di server
  let supabase;
  try {
    const auth = await periksaLogin();
    supabase = auth.supabase;
  } catch {
    return { error: "Anda harus login terlebih dahulu." };
  }

  // Ambil data dari form
  const nama = formData.get("nama")?.trim();
  const hargaStr = formData.get("harga");
  const kategori = formData.get("kategori")?.trim();
  const foto_url = formData.get("foto_url")?.trim();
  const deskripsi = formData.get("deskripsi")?.trim();

  // Validasi input
  if (!nama) {
    return { error: "Nama produk harus diisi." };
  }

  const harga = parseInt(hargaStr, 10);
  if (isNaN(harga) || harga < 0) {
    return { error: "Harga harus berupa angka 0 atau lebih." };
  }

  if (!kategori) {
    return { error: "Kategori harus diisi." };
  }

  // Update database
  const { error } = await supabase
    .from("produk")
    .update({
      nama,
      harga,
      kategori,
      foto_url: foto_url || null,
      deskripsi: deskripsi || null,
    })
    .eq("id", id);

  if (error) {
    return { error: "Gagal menyimpan perubahan: " + error.message };
  }

  // Revalidate cache dan redirect
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/produk/${id}`);
  redirect("/admin");
}

// US-10: Hapus produk
export async function hapusProduk(id) {
  // Validasi login di server
  let supabase;
  try {
    const auth = await periksaLogin();
    supabase = auth.supabase;
  } catch (err) {
    throw new Error("Anda harus login terlebih dahulu.");
  }

  // Hapus dari database
  const { error } = await supabase.from("produk").delete().eq("id", id);

  if (error) {
    throw new Error("Gagal menghapus produk: " + error.message);
  }

  // Revalidate cache
  revalidatePath("/admin");
  revalidatePath("/");
}
