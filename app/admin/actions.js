"use server";

import { redirect } from "next/navigation";
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
